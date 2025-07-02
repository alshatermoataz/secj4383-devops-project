import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../index';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const cartDoc = await db.collection('carts').doc(userId).get();
    
    if (!cartDoc.exists) {
      return res.json({ items: [], total: 0 });
    }

    const cartData = cartDoc.data();
    res.json(cartData);

  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add',
  authenticateToken,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
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

      const { productId, quantity } = req.body;

      // Get product details
      const productDoc = await db.collection('products').doc(productId).get();
      if (!productDoc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = { id: productDoc.id, ...productDoc.data() } as any;

      // Get current cart
      const cartDoc = await db.collection('carts').doc(userId).get();
      let cartData: any = cartDoc.exists ? cartDoc.data() : { items: [], total: 0 };

      // Check if item already exists in cart
      const existingItemIndex = cartData.items.findIndex((item: any) => item.productId === productId);

      if (existingItemIndex >= 0) {
        // Update quantity
        cartData.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cartData.items.push({
          productId,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '',
          quantity
        });
      }

      // Calculate total
      cartData.total = cartData.items.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );
      cartData.updatedAt = new Date().toISOString();

      // Save cart
      await db.collection('carts').doc(userId).set(cartData);

      res.json({
        message: 'Item added to cart',
        cart: cartData
      });

    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  }
);

// Update cart item quantity
router.put('/update',
  authenticateToken,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or greater'),
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

      const { productId, quantity } = req.body;

      const cartDoc = await db.collection('carts').doc(userId).get();
      if (!cartDoc.exists) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      let cartData: any = cartDoc.data();

      if (quantity === 0) {
        // Remove item
        cartData.items = cartData.items.filter((item: any) => item.productId !== productId);
      } else {
        // Update quantity
        const itemIndex = cartData.items.findIndex((item: any) => item.productId === productId);
        if (itemIndex >= 0) {
          cartData.items[itemIndex].quantity = quantity;
        } else {
          return res.status(404).json({ error: 'Item not found in cart' });
        }
      }

      // Recalculate total
      cartData.total = cartData.items.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );
      cartData.updatedAt = new Date().toISOString();

      await db.collection('carts').doc(userId).set(cartData);

      res.json({
        message: 'Cart updated',
        cart: cartData
      });

    } catch (error) {
      console.error('Update cart error:', error);
      res.status(500).json({ error: 'Failed to update cart' });
    }
  }
);

// Remove item from cart
router.delete('/remove/:productId', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { productId } = req.params;

    const cartDoc = await db.collection('carts').doc(userId).get();
    if (!cartDoc.exists) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    let cartData: any = cartDoc.data();
    cartData.items = cartData.items.filter((item: any) => item.productId !== productId);

    // Recalculate total
    cartData.total = cartData.items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    cartData.updatedAt = new Date().toISOString();

    await db.collection('carts').doc(userId).set(cartData);

    res.json({
      message: 'Item removed from cart',
      cart: cartData
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await db.collection('carts').doc(userId).delete();

    res.json({ message: 'Cart cleared' });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Checkout (create order)
router.post('/checkout',
  authenticateToken,
  [
    body('shippingAddressId').notEmpty().withMessage('Shipping address is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
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

      // Get cart
      const cartDoc = await db.collection('carts').doc(userId).get();
      if (!cartDoc.exists) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      const cartData: any = cartDoc.data();
      if (cartData.items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Get user data for shipping address
      const userDoc = await db.collection('users').doc(userId).get();
      const userData: any = userDoc.data();
      const shippingAddress = userData?.addresses?.find((addr: any) => addr.id === req.body.shippingAddressId);

      if (!shippingAddress) {
        return res.status(400).json({ error: 'Invalid shipping address' });
      }

      // Create order
      const orderId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const orderData = {
        id: orderId,
        userId,
        items: cartData.items,
        total: cartData.total,
        shippingAddress,
        paymentMethod: req.body.paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save order
      await db.collection('orders').doc(orderId).set(orderData);

      // Clear cart
      await db.collection('carts').doc(userId).delete();

      res.status(201).json({
        message: 'Order created successfully',
        order: orderData
      });

    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ error: 'Failed to process checkout' });
    }
  }
);

export default router;
