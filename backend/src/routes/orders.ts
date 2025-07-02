import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../index';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get user's orders (order history)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const ordersQuery = await db.collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const orders = ordersQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(orders);

  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get specific order details
router.get('/:orderId', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.uid;
    const { orderId } = req.params;

    const orderDoc = await db.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();
    
    // Check if user owns this order (or is admin)
    if (orderData?.userId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: orderDoc.id,
      ...orderData
    });

  } catch (error) {
    console.error('Order fetch error:', error);
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