import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { db } from '../index';
import { Product, ProductSearchQuery, ProductSearchResult, ProductFilters } from '../types/express';
import { QueryDocumentSnapshot, DocumentData, Query } from 'firebase-admin/firestore';
import { authenticateToken, requireAdmin, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Helper function to build search query
function buildProductQuery(filters: ProductFilters): Query<DocumentData> {
  let query = db.collection('products').where('isActive', '==', true);

  if (filters.category) {
    query = query.where('category', '==', filters.category);
  }

  if (filters.brand) {
    query = query.where('brand', '==', filters.brand);
  }

  if (filters.isFeatured !== undefined) {
    query = query.where('isFeatured', '==', filters.isFeatured);
  }

  if (filters.inStock) {
    query = query.where('stock', '>', 0);
  }

  return query;
}

// Helper function to filter products by price and text search
function filterProducts(products: Product[], filters: ProductFilters, searchQuery?: string): Product[] {
  let filtered = products;

  // Price filtering
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice!);
  }

  // Text search
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }

  // Tag filtering
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(p => 
      p.tags && filters.tags!.some(tag => p.tags.includes(tag))
    );
  }

  return filtered;
}

// Helper function to sort products
function sortProducts(products: Product[], sortBy: string, sortOrder: string): Product[] {
  return products.sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'rating':
        aValue = a.rating?.average || 0;
        bValue = b.rating?.average || 0;
        break;
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}

// Search and browse products with filtering
router.get('/search',
  [
    query('q').optional().trim(),
    query('category').optional().trim(),
    query('brand').optional().trim(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('tags').optional().trim(),
    query('inStock').optional().isBoolean(),
    query('isFeatured').optional().isBoolean(),
    query('sortBy').optional().isIn(['name', 'price', 'createdAt', 'rating']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  optionalAuth,
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Invalid query parameters',
          details: errors.array() 
        });
      }

      const {
        q: searchQuery,
        category,
        brand,
        minPrice,
        maxPrice,
        tags,
        inStock,
        isFeatured,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = req.query as ProductSearchQuery;

      // Build filters
      const filters: ProductFilters = {
        category,
        brand,
        minPrice: minPrice ? parseFloat(minPrice.toString()) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice.toString()) : undefined,
        tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
        inStock: inStock ? String(inStock) === 'true' : undefined,
        isFeatured: isFeatured ? String(isFeatured) === 'true' : undefined,
        isActive: true
      };

      // Build Firestore query
      let query = buildProductQuery(filters);

      // Execute query
      const snapshot = await query.get();
      let products = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      // Apply client-side filtering (price range, text search, tags)
      products = filterProducts(products, filters, searchQuery);

      // Sort products
      products = sortProducts(products, sortBy, sortOrder);

      // Pagination
      const totalCount = products.length;
      const pageNum = parseInt(page.toString());
      const limitNum = parseInt(limit.toString());
      const totalPages = Math.ceil(totalCount / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      const paginatedProducts = products.slice(startIndex, endIndex);

      const result: ProductSearchResult = {
        products: paginatedProducts,
        totalCount,
        currentPage: pageNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      };

      res.json(result);

    } catch (error) {
      console.error('Product search error:', error);
      res.status(500).json({ error: 'Failed to search products' });
    }
  }
);

// Get all products (with basic filtering)
router.get('/', 
  [
    query('category').optional().trim(),
    query('featured').optional().isBoolean(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  optionalAuth,
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Invalid query parameters',
          details: errors.array() 
        });
      }

      const { category, featured, limit = 50 } = req.query;

      let query = db.collection('products').where('isActive', '==', true);

      if (category) {
        query = query.where('category', '==', category);
      }

      if (featured === 'true') {
        query = query.where('isFeatured', '==', true);
      }

      query = query.limit(parseInt(limit.toString()));

      const snapshot = await query.get();
      const products = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }
);

// Get featured products
router.get('/featured', async (_req: express.Request, res: express.Response) => {
  try {
    const snapshot = await db.collection('products')
      .where('isActive', '==', true)
      .where('isFeatured', '==', true)
      .limit(12)
      .get();

    const products = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// Get products by category
router.get('/category/:category', async (req: express.Request, res: express.Response) => {
  try {
    const { category } = req.params;
    const { limit = 50 } = req.query;

    const snapshot = await db.collection('products')
      .where('isActive', '==', true)
      .where('category', '==', category)
      .limit(parseInt(limit.toString()))
      .get();

    const products = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// Get products by brand
router.get('/brand/:brand', async (req: express.Request, res: express.Response) => {
  try {
    const { brand } = req.params;
    const { limit = 50 } = req.query;

    const snapshot = await db.collection('products')
      .where('isActive', '==', true)
      .where('brand', '==', brand)
      .limit(parseInt(limit.toString()))
      .get();

    const products = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by brand:', error);
    res.status(500).json({ error: 'Failed to fetch products by brand' });
  }
});

// Get similar/related products
router.get('/:id/related', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // Get the current product
    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productDoc.data() as Product;

    // Find related products by category and brand
    const snapshot = await db.collection('products')
      .where('isActive', '==', true)
      .where('category', '==', product.category)
      .limit(8)
      .get();

    let relatedProducts = snapshot.docs
      .map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(p => p.id !== id) as Product[];

    // If we don't have enough from same category, add by brand
    if (relatedProducts.length < 4) {
      const brandSnapshot = await db.collection('products')
        .where('isActive', '==', true)
        .where('brand', '==', product.brand)
        .limit(8)
        .get();

      const brandProducts = brandSnapshot.docs
        .map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(p => p.id !== id && !relatedProducts.find(rp => rp.id === p.id)) as Product[];

      relatedProducts = [...relatedProducts, ...brandProducts].slice(0, 6);
    }

    res.json(relatedProducts);
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ error: 'Failed to fetch related products' });
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

    // Only return active products to regular users
    if (!product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Admin routes (require authentication and admin role)

// Create a new product (Admin only)
router.post('/',
  authenticateToken,
  requireAdmin,
  [
    body('name').notEmpty().trim().withMessage('Product name is required'),
    body('description').notEmpty().trim().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').notEmpty().trim().withMessage('Category is required'),
    body('brand').notEmpty().trim().withMessage('Brand is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
    body('tags').optional().isArray(),
    body('isFeatured').optional().isBoolean(),
    body('compareAtPrice').optional().isFloat({ min: 0 }),
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

      const productData = {
        ...req.body,
        isActive: true,
        tags: req.body.tags || [],
        createdAt: new Date().toISOString(),
      };

      const productRef = await db.collection('products').add(productData);

      const product: Product = {
        id: productRef.id,
        ...productData
      };

      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// Update a product (Admin only)
router.put('/:id',
  authenticateToken,
  requireAdmin,
  [
    body('name').optional().notEmpty().trim(),
    body('description').optional().notEmpty().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().notEmpty().trim(),
    body('brand').optional().notEmpty().trim(),
    body('stock').optional().isInt({ min: 0 }),
    body('images').optional().isArray({ min: 1 }),
    body('tags').optional().isArray(),
    body('isActive').optional().isBoolean(),
    body('isFeatured').optional().isBoolean(),
    body('compareAtPrice').optional().isFloat({ min: 0 }),
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

      const productRef = db.collection('products').doc(req.params.id);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

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

// Delete/Deactivate a product (Admin only)
router.delete('/:id', 
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const productRef = db.collection('products').doc(req.params.id);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Instead of deleting, deactivate the product
      await productRef.update({
        isActive: false,
        updatedAt: new Date().toISOString()
      });

      res.json({ message: 'Product deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating product:', error);
      res.status(500).json({ error: 'Failed to deactivate product' });
    }
  }
);

// Get all products including inactive ones (Admin only)
router.get('/admin/all',
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string; // 'active', 'inactive', 'all'

      let query: Query<DocumentData> = db.collection('products');

      // Filter by status
      if (status === 'active') {
        query = query.where('isActive', '==', true);
      } else if (status === 'inactive') {
        query = query.where('isActive', '==', false);
      }
      // If status is 'all' or undefined, don't filter

      const querySnapshot = await query
        .orderBy('createdAt', 'desc')
        .get();

      const allProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      // Manual pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const products = allProducts.slice(startIndex, endIndex);

      res.json({
        products,
        totalCount: allProducts.length,
        currentPage: page,
        totalPages: Math.ceil(allProducts.length / limit),
        hasNextPage: endIndex < allProducts.length,
        hasPreviousPage: page > 1
      });

    } catch (error) {
      console.error('Error fetching admin products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }
);

// Update product stock (Admin only)
router.patch('/:id/stock',
  authenticateToken,
  requireAdmin,
  [
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('action').optional().isIn(['set', 'add', 'subtract']).withMessage('Action must be set, add, or subtract'),
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

      const productRef = db.collection('products').doc(req.params.id);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const currentProduct = productDoc.data() as Product;
      const { stock, action = 'set' } = req.body;

      let newStock: number;
      switch (action) {
        case 'add':
          newStock = currentProduct.stock + stock;
          break;
        case 'subtract':
          newStock = Math.max(0, currentProduct.stock - stock);
          break;
        default: // 'set'
          newStock = stock;
      }

      await productRef.update({
        stock: newStock,
        updatedAt: new Date().toISOString()
      });

      res.json({
        message: 'Stock updated successfully',
        productId: req.params.id,
        previousStock: currentProduct.stock,
        newStock,
        action
      });

    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({ error: 'Failed to update stock' });
    }
  }
);

// Update product pricing (Admin only)
router.patch('/:id/pricing',
  authenticateToken,
  requireAdmin,
  [
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('compareAtPrice').optional().isFloat({ min: 0 }).withMessage('Compare at price must be positive'),
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

      const productRef = db.collection('products').doc(req.params.id);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const updateData: any = {
        price: req.body.price,
        updatedAt: new Date().toISOString()
      };

      if (req.body.compareAtPrice !== undefined) {
        updateData.compareAtPrice = req.body.compareAtPrice;
      }

      await productRef.update(updateData);

      const updatedDoc = await productRef.get();
      const updatedProduct = {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Product;

      res.json({
        message: 'Pricing updated successfully',
        product: updatedProduct
      });

    } catch (error) {
      console.error('Error updating pricing:', error);
      res.status(500).json({ error: 'Failed to update pricing' });
    }
  }
);

// Bulk update products (Admin only)
router.patch('/admin/bulk-update',
  authenticateToken,
  requireAdmin,
  [
    body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required'),
    body('updates').isObject().withMessage('Updates object is required'),
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

      const { productIds, updates } = req.body;
      const batch = db.batch();

      for (const productId of productIds) {
        const productRef = db.collection('products').doc(productId);
        batch.update(productRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      }

      await batch.commit();

      res.json({
        message: 'Bulk update completed successfully',
        updatedProductCount: productIds.length,
        updates
      });

    } catch (error) {
      console.error('Error bulk updating products:', error);
      res.status(500).json({ error: 'Failed to bulk update products' });
    }
  }
);

// Get product analytics (Admin only)
router.get('/admin/analytics',
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const productsQuery = await db.collection('products').get();
      const products = productsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      const analytics = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        inactiveProducts: products.filter(p => !p.isActive).length,
        featuredProducts: products.filter(p => p.isFeatured).length,
        outOfStockProducts: products.filter(p => p.stock === 0).length,
        lowStockProducts: products.filter(p => p.stock > 0 && p.stock <= 10).length,
        totalInventoryValue: products
          .filter(p => p.isActive)
          .reduce((sum, p) => sum + (p.price * p.stock), 0),
        averagePrice: products
          .filter(p => p.isActive)
          .reduce((sum, p) => sum + p.price, 0) / products.filter(p => p.isActive).length || 0,
        categoriesCount: [...new Set(products.map(p => p.category))].length,
        brandsCount: [...new Set(products.map(p => p.brand))].length,
        topCategories: Object.entries(
          products.reduce((acc: any, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
          }, {})
        ).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 5),
        topBrands: Object.entries(
          products.reduce((acc: any, p) => {
            acc[p.brand] = (acc[p.brand] || 0) + 1;
            return acc;
          }, {})
        ).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 5)
      };

      res.json(analytics);

    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  }
);

export default router;