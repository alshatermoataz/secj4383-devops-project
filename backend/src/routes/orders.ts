import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../index';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import { Query, DocumentData } from 'firebase-admin/firestore';

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

// Update order status (admin only)
router.put('/:orderId/status',
  authenticateToken,
  requireRole(['admin']),
  [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
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

      const { orderId } = req.params;
      const { status } = req.body;

      const orderDoc = await db.collection('orders').doc(orderId).get();
      
      if (!orderDoc.exists) {
        return res.status(404).json({ error: 'Order not found' });
      }

      await db.collection('orders').doc(orderId).update({
        status,
        updatedAt: new Date().toISOString()
      });

      res.json({
        message: 'Order status updated',
        orderId,
        status
      });

    } catch (error) {
      console.error('Order update error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
);

// Get all orders with filtering (admin only)
router.get('/admin/all',
  authenticateToken,
  requireRole(['admin']),
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      let query: Query<DocumentData> = db.collection('orders');

      // Filter by status
      if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        query = query.where('status', '==', status);
      }

      // Filter by date range
      if (startDate) {
        query = query.where('createdAt', '>=', startDate);
      }
      if (endDate) {
        query = query.where('createdAt', '<=', endDate);
      }

      const ordersQuery = await query.orderBy('createdAt', 'desc').get();
      const allOrders = ordersQuery.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));

      // Manual pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const orders = allOrders.slice(startIndex, endIndex);

      res.json({
        orders,
        totalCount: allOrders.length,
        currentPage: page,
        totalPages: Math.ceil(allOrders.length / limit),
        hasNextPage: endIndex < allOrders.length,
        hasPreviousPage: page > 1
      });

    } catch (error) {
      console.error('Orders fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }
);

// Get order analytics (admin only)
router.get('/admin/analytics',
  authenticateToken,
  requireRole(['admin']),
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const ordersQuery = await db.collection('orders').get();
      const orders = ordersQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const recentOrders = orders.filter(order => 
        new Date(order.createdAt) >= thirtyDaysAgo
      );

      const weeklyOrders = orders.filter(order => 
        new Date(order.createdAt) >= sevenDaysAgo
      );

      const analytics = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
        averageOrderValue: orders.length > 0 
          ? orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length 
          : 0,
        ordersByStatus: {
          pending: orders.filter(o => o.status === 'pending').length,
          processing: orders.filter(o => o.status === 'processing').length,
          shipped: orders.filter(o => o.status === 'shipped').length,
          delivered: orders.filter(o => o.status === 'delivered').length,
          cancelled: orders.filter(o => o.status === 'cancelled').length,
        },
        recentMetrics: {
          ordersLast30Days: recentOrders.length,
          revenueLast30Days: recentOrders.reduce((sum, order) => sum + (order.total || 0), 0),
          ordersLast7Days: weeklyOrders.length,
          revenueLast7Days: weeklyOrders.reduce((sum, order) => sum + (order.total || 0), 0),
        },
        topCustomers: Object.entries(
          orders.reduce((acc: any, order) => {
            acc[order.userId] = (acc[order.userId] || 0) + (order.total || 0);
            return acc;
          }, {})
        ).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 10)
      };

      res.json(analytics);

    } catch (error) {
      console.error('Analytics fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
);

// Bulk update order status (admin only)
router.patch('/admin/bulk-update',
  authenticateToken,
  requireRole(['admin']),
  [
    body('orderIds').isArray({ min: 1 }).withMessage('Order IDs array is required'),
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
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

      const { orderIds, status } = req.body;
      const batch = db.batch();

      for (const orderId of orderIds) {
        const orderRef = db.collection('orders').doc(orderId);
        batch.update(orderRef, {
          status,
          updatedAt: new Date().toISOString()
        });
      }

      await batch.commit();

      res.json({
        message: 'Bulk order update completed successfully',
        updatedOrderCount: orderIds.length,
        newStatus: status
      });

    } catch (error) {
      console.error('Bulk update error:', error);
      res.status(500).json({ error: 'Failed to bulk update orders' });
    }
  }
);

export default router;