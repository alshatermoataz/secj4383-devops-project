import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../index';
import { Order, Product } from '../types/express';
import { QueryDocumentSnapshot, DocumentData, CollectionReference } from 'firebase-admin/firestore';

const router = express.Router();

// Get all orders (with optional user filter)
router.get('/', async (_req: express.Request, res: express.Response) => {
  try {
    const ordersCollection = db.collection('orders') as CollectionReference<DocumentData>;
    const ordersSnapshot = await ordersCollection.orderBy('createdAt', 'desc').get();
    const orders = ordersSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get a single order
router.get('/:id', async (req, res) => {
  try {
    const orderDoc = await db.collection('orders').doc(req.params.id).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = {
      id: orderDoc.id,
      ...orderDoc.data()
    } as Order;

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create a new order
router.post('/',
  [
    body('userId').notEmpty(),
    body('items').isArray(),
    body('items.*.productId').notEmpty(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('shippingAddress').notEmpty(),
    body('totalAmount').isFloat({ min: 0 }),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, items, shippingAddress, totalAmount } = req.body as Omit<Order, 'id' | 'status' | 'createdAt'>;

      // Verify all products exist and have sufficient stock
      for (const item of items) {
        const productDoc = await db.collection('products').doc(item.productId).get();
        if (!productDoc.exists) {
          return res.status(400).json({ error: `Product ${item.productId} not found` });
        }
        const product = productDoc.data() as Product;
        if (!product.stock || product.stock < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
        }
      }

      // Create the order
      const orderRef = await db.collection('orders').add({
        userId,
        items,
        shippingAddress,
        totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // Update product stock
      for (const item of items) {
        const productRef = db.collection('products').doc(item.productId);
        await db.runTransaction(async (transaction) => {
          const productDoc = await transaction.get(productRef);
          const product = productDoc.data() as Product;
          if (!product.stock) {
            throw new Error(`Product ${item.productId} has no stock information`);
          }
          transaction.update(productRef, { stock: product.stock - item.quantity });
        });
      }

      const order: Order = {
        id: orderRef.id,
        userId,
        items,
        shippingAddress,
        totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
);

// Update order status
router.patch('/:id/status',
  [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status } = req.body as { status: Order['status'] };
      const orderRef = db.collection('orders').doc(req.params.id);
      const orderDoc = await orderRef.get();

      if (!orderDoc.exists) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const updateData: Partial<Order> = {
        status,
        updatedAt: new Date().toISOString(),
      };

      await orderRef.update(updateData);

      const updatedDoc = await orderRef.get();
      const updatedOrder = {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Order;

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
);

export default router; 