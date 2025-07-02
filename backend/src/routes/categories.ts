import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../index';
import { Category } from '../types/express';
import { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get all categories
router.get('/', async (_req: express.Request, res: express.Response) => {
  try {
    const snapshot = await db.collection('categories')
      .where('isActive', '==', true)
      .get();

    const categories = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productSnapshot = await db.collection('products')
          .where('category', '==', category.id)
          .where('isActive', '==', true)
          .get();

        return {
          ...category,
          productCount: productSnapshot.size
        };
      })
    );

    res.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const categoryDoc = await db.collection('categories').doc(req.params.id).get();
    
    if (!categoryDoc.exists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = {
      id: categoryDoc.id,
      ...categoryDoc.data()
    } as Category;

    if (!category.isActive) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get product count
    const productSnapshot = await db.collection('products')
      .where('category', '==', category.id)
      .where('isActive', '==', true)
      .get();

    const categoryWithCount = {
      ...category,
      productCount: productSnapshot.size
    };

    res.json(categoryWithCount);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create category (Admin only)
router.post('/',
  authenticateToken,
  requireAdmin,
  [
    body('name').notEmpty().trim().withMessage('Category name is required'),
    body('description').notEmpty().trim().withMessage('Description is required'),
    body('parentId').optional().trim(),
    body('imageUrl').optional().isURL(),
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

      const categoryData = {
        ...req.body,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const categoryRef = await db.collection('categories').add(categoryData);

      const category: Category = {
        id: categoryRef.id,
        ...categoryData
      };

      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
);

// Update category (Admin only)
router.put('/:id',
  authenticateToken,
  requireAdmin,
  [
    body('name').optional().notEmpty().trim(),
    body('description').optional().notEmpty().trim(),
    body('parentId').optional().trim(),
    body('imageUrl').optional().isURL(),
    body('isActive').optional().isBoolean(),
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

      const categoryRef = db.collection('categories').doc(req.params.id);
      const categoryDoc = await categoryRef.get();

      if (!categoryDoc.exists) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      await categoryRef.update(updateData);

      const updatedDoc = await categoryRef.get();
      const updatedCategory = {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Category;

      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
);

// Delete/Deactivate category (Admin only)
router.delete('/:id', 
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const categoryRef = db.collection('categories').doc(req.params.id);
      const categoryDoc = await categoryRef.get();

      if (!categoryDoc.exists) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Check if category has products
      const productSnapshot = await db.collection('products')
        .where('category', '==', req.params.id)
        .where('isActive', '==', true)
        .get();

      if (!productSnapshot.empty) {
        return res.status(400).json({ 
          error: 'Cannot delete category with active products',
          productCount: productSnapshot.size
        });
      }

      // Deactivate the category
      await categoryRef.update({
        isActive: false,
        updatedAt: new Date().toISOString()
      });

      res.json({ message: 'Category deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating category:', error);
      res.status(500).json({ error: 'Failed to deactivate category' });
    }
  }
);

export default router;
