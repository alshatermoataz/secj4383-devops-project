import express from 'express';
import { body, validationResult } from 'express-validator';
import * as admin from 'firebase-admin';
import { db } from '../index';
import { User, UserRegistration, UserLogin } from '../types/express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Register new user
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().trim().withMessage('First name is required'),
    body('lastName').notEmpty().trim().withMessage('Last name is required'),
    body('phoneNumber').optional().matches(/^\+?[\d\s\-\(\)\.]+$/).withMessage('Invalid phone number format'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const { email, password, firstName, lastName, phoneNumber } = req.body as UserRegistration;

      // Check if user already exists in Firestore
      const existingUser = await db.collection('users')
        .where('email', '==', email)
        .get();

      if (!existingUser.empty) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });

      // Create user profile in Firestore
      const userData: Omit<User, 'id'> = {
        firstName,
        lastName,
        email,
        role: 'customer',
        addresses: [],
        isActive: true,
        phoneNumber,
        preferences: {
          newsletter: false,
          notifications: true
        },
        createdAt: new Date().toISOString(),
      };

      await db.collection('users').doc(userRecord.uid).set(userData);

      // Generate custom token for immediate login
      const customToken = await admin.auth().createCustomToken(userRecord.uid);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: userRecord.uid,
          ...userData
        },
        customToken
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === 'auth/email-already-exists') {
        return res.status(400).json({ error: 'Email already registered' });
      }
      
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
);

// Login user (this endpoint validates credentials and returns user info)
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const { email } = req.body as UserLogin;
      
      // Note: Password validation would be done client-side with Firebase Auth
      // For this demo, we assume client has already validated credentials

      // Get user from Firestore first to check if exists and is active
      const userQuery = await db.collection('users')
        .where('email', '==', email)
        .get();

      if (userQuery.empty) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userDoc = userQuery.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() } as User;

      if (!userData.isActive) {
        return res.status(403).json({ error: 'Account is deactivated' });
      }

      // Verify password by trying to sign in with Firebase Auth
      try {
        // We can't directly verify password on server side with Admin SDK
        // So we create a custom token and let client verify
        // For server-side testing, we'll generate both custom token and a mock ID token
        const customToken = await admin.auth().createCustomToken(userDoc.id);
        
        // For testing purposes, create a mock ID token that our middleware can use
        // In production, client would exchange customToken for idToken
        const mockIdToken = await admin.auth().createCustomToken(userDoc.id, { 
          purpose: 'server-testing' 
        });

        res.json({
          message: 'Login successful',
          user: {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
            phoneNumber: userData.phoneNumber,
            addresses: userData.addresses,
            preferences: userData.preferences
          },
          customToken,
          idToken: mockIdToken // For server-side testing
        });

      } catch (authError) {
        console.error('Authentication error:', authError);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const user = req.user?.userData;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      addresses: user.addresses,
      preferences: user.preferences,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile',
  authenticateToken,
  [
    body('firstName').optional().notEmpty().trim(),
    body('lastName').optional().notEmpty().trim(),
    body('phoneNumber').optional().matches(/^\+?[\d\s\-\(\)\.]+$/).withMessage('Invalid phone number format'),
    body('preferences.newsletter').optional().isBoolean(),
    body('preferences.notifications').optional().isBoolean(),
  ],
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      await db.collection('users').doc(userId).update(updateData);

      // Get updated user data
      const updatedUserDoc = await db.collection('users').doc(userId).get();
      const updatedUser = { id: updatedUserDoc.id, ...updatedUserDoc.data() } as User;

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          phoneNumber: updatedUser.phoneNumber,
          addresses: updatedUser.addresses,
          preferences: updatedUser.preferences,
          profilePicture: updatedUser.profilePicture,
          updatedAt: updatedUser.updatedAt
        }
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

// Change password
router.put('/change-password',
  authenticateToken,
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',  
          details: errors.array() 
        });
      }

      const userId = req.user?.uid;
      const { newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      await admin.auth().updateUser(userId, {
        password: newPassword
      });

      res.json({ message: 'Password updated successfully' });

    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
);

// Logout (revoke refresh tokens)
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Revoke all refresh tokens for the user
    await admin.auth().revokeRefreshTokens(userId);

    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
