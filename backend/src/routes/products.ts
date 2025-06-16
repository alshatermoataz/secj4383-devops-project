import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../index';
import { Product } from '../types/express';
import { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';

const router = express.Router();

// Get all products
router.get('/', async (_req: express.Request, res: express.Response) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    const products = productsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a single product
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const productDoc = await db.collection('products').doc(req.params.id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = {
      id: productDoc.id,
      ...productDoc.data()
    } as Product;

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create a new product
router.post('/',
  [
    body('name').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('price').isFloat({ min: 0 }),
    body('imageUrl').isURL(),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, price, imageUrl } = req.body as Omit<Product, 'id'>;
      const productRef = await db.collection('products').add({
        name,
        description,
        price,
        imageUrl,
        createdAt: new Date().toISOString(),
      });

      const product: Product = {
        id: productRef.id,
        name,
        description,
        price,
        imageUrl,
      };

      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// Update a product
router.put('/:id',
  [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('imageUrl').optional().isURL(),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const productRef = db.collection('products').doc(req.params.id);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const updateData: Partial<Product> = {
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      await productRef.update(updateData);

      const updatedDoc = await productRef.get();
      const updatedProduct = {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Product;

      res.json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

// Delete a product
router.delete('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const productRef = db.collection('products').doc(req.params.id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await productRef.delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router; 