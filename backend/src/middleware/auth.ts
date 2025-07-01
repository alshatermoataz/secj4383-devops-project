import express, { Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { db } from '../index';
import { User } from '../types/express';

export interface AuthenticatedRequest extends express.Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
    userData?: User;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers?.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const userData = { id: userDoc.id, ...userDoc.data() } as User;
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role,
      userData: userData
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role || 'guest')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireAdmin = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  requireRole(['admin'])(req, _res, next);
};

export const requireCustomer = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  requireRole(['customer', 'admin'])(req, _res, next);
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers?.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      
      if (userDoc.exists) {
        const userData = { id: userDoc.id, ...userDoc.data() } as User;
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: userData.role,
          userData: userData
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
}; 