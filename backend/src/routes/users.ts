import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../index';
import { User } from '../types/express';
import { QueryDocumentSnapshot, DocumentData, CollectionReference } from 'firebase-admin/firestore';

const router = express.Router();

// Get all users
router.get('/', async (_req: express.Request, res: express.Response) => {
  try {
    const usersCollection = db.collection('users') as CollectionReference<DocumentData>;
    const usersSnapshot = await usersCollection.get();
    const users = usersSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get a single user
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = {
      id: userDoc.id,
      ...userDoc.data()
    } as User;

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create a new user
router.post('/',
  [
    body('email').isEmail(),
    body('name').notEmpty().trim(),
    body('role').isIn(['customer', 'admin']),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, name, role } = req.body as Omit<User, 'id' | 'createdAt'>;

      // Check if user already exists
      const existingUser = await db.collection('users')
        .where('email', '==', email)
        .get();

      if (!existingUser.empty) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const userRef = await db.collection('users').add({
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
      });

      const user: User = {
        id: userRef.id,
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
      };

      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

// Update a user
router.put('/:id',
  [
    body('email').optional().isEmail(),
    body('name').optional().trim(),
    body('role').optional().isIn(['customer', 'admin']),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userRef = db.collection('users').doc(req.params.id);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updateData: Partial<User> = {
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      await userRef.update(updateData);

      const updatedDoc = await userRef.get();
      const updatedUser = {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as User;

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

// Delete a user
router.delete('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const userRef = db.collection('users').doc(req.params.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userRef.delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router; 