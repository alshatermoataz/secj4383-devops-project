# Product Browsing and Search System

## Overview
Complete product catalog management with advanced search, filtering, and browsing capabilities for your e-commerce platform.

## Features Implemented

### ✅ Product Browsing
- **Product Catalog**: Browse all active products
- **Featured Products**: Highlighted products for homepage
- **Category Browsing**: Products filtered by category
- **Brand Browsing**: Products filtered by brand
- **Related Products**: Find similar products
- **Pagination**: Handle large product catalogs efficiently

### ✅ Advanced Search
- **Text Search**: Search by product name, description, brand, and tags
- **Category Filtering**: Filter by product categories
- **Brand Filtering**: Filter by specific brands
- **Price Range Filtering**: Set minimum and maximum price limits
- **Tag-based Filtering**: Filter by product tags
- **Stock Filtering**: Show only in-stock products
- **Featured Filtering**: Show only featured products

### ✅ Sorting Options
- **By Name**: Alphabetical sorting
- **By Price**: Price-based sorting (low to high, high to low)
- **By Date**: Newest or oldest first
- **By Rating**: Highest rated products first

### ✅ Admin Product Management
- **CRUD Operations**: Create, read, update, delete products
- **Inventory Management**: Track stock levels
- **Product Activation**: Enable/disable products
- **Bulk Operations**: Manage multiple products

## API Endpoints

### Product Search & Browse

#### Advanced Product Search
```http
GET /api/products/search?q=iPhone&category=electronics&minPrice=500&maxPrice=1500&sortBy=price&sortOrder=asc&page=1&limit=20
```

**Query Parameters:**
- `q` (string): Search query text
- `category` (string): Filter by category ID
- `brand` (string): Filter by brand name
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `tags` (string): Comma-separated tags (e.g., "smartphone,premium")
- `inStock` (boolean): Only show in-stock products
- `isFeatured` (boolean): Only show featured products
- `sortBy` (string): Sort field - `name`, `price`, `createdAt`, `rating`
- `sortOrder` (string): Sort direction - `asc`, `desc`
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "products": [
    {
      "id": "product123",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone model...",
      "price": 999.99,
      "compareAtPrice": 1099.99,
      "category": "electronics",
      "brand": "Apple",
      "sku": "IPH15PRO-128",
      "stock": 50,
      "images": ["image1.jpg", "image2.jpg"],
      "thumbnail": "thumb.jpg",
      "isActive": true,
      "isFeatured": true,
      "tags": ["smartphone", "apple", "premium"],
      "specifications": {
        "display": "6.1-inch Super Retina XDR",
        "storage": "128GB"
      },
      "rating": {
        "average": 4.8,
        "count": 1247
      },
      "dimensions": {
        "weight": 187,
        "length": 146.6,
        "width": 70.6,
        "height": 8.25
      },
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "totalCount": 156,
  "currentPage": 1,
  "totalPages": 8,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

#### Browse All Products
```http
GET /api/products?category=electronics&featured=true&limit=50
```

#### Get Featured Products
```http
GET /api/products/featured
```

#### Browse by Category
```http
GET /api/products/category/electronics?limit=20
```

#### Browse by Brand
```http
GET /api/products/brand/Apple?limit=20
```

#### Get Related Products
```http
GET /api/products/:productId/related
```

#### Get Single Product
```http
GET /api/products/:productId
```

### Category Management

#### Get All Categories
```http
GET /api/categories
```

**Response:**
```json
[
  {
    "id": "electronics",
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "imageUrl": "electronics.jpg",
    "isActive": true,
    "productCount": 45,
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

#### Get Single Category
```http
GET /api/categories/:categoryId
```

### Admin-Only Endpoints (Require Authentication + Admin Role)

#### Create Product
```http
POST /api/products
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "compareAtPrice": 149.99,
  "category": "electronics",
  "brand": "BrandName",
  "stock": 50,
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["tag1", "tag2"],
  "isFeatured": false,
  "specifications": {
    "key": "value"
  }
}
```

#### Update Product
```http
PUT /api/products/:productId
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "price": 89.99,
  "stock": 75,
  "isFeatured": true
}
```

#### Deactivate Product
```http
DELETE /api/products/:productId
Authorization: Bearer YOUR_ADMIN_TOKEN
```

#### Create Category
```http
POST /api/categories
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "New Category",
  "description": "Category description",
  "imageUrl": "category.jpg"
}
```

#### Update Category
```http
PUT /api/categories/:categoryId
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Updated Category Name",
  "description": "Updated description"
}
```

## Product Schema

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number; // Original price for showing discounts
  category: string;
  brand: string;
  sku?: string; // Stock Keeping Unit
  stock: number;
  images: string[]; // Array of image URLs
  thumbnail?: string; // Main thumbnail image
  isActive: boolean; // Product visibility
  isFeatured?: boolean; // Featured on homepage
  tags: string[]; // Searchable tags
  specifications?: Record<string, any>; // Product specs
  rating?: {
    average: number;
    count: number;
  };
  dimensions?: {
    weight?: number; // in grams
    length?: number; // in mm
    width?: number; // in mm
    height?: number; // in mm
  };
  createdAt: string;
  updatedAt?: string;
}
```

## Category Schema

```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string; // For nested categories
  imageUrl?: string;
  isActive: boolean;
  productCount?: number; // Calculated field
  createdAt: string;
  updatedAt?: string;
}
```

## Search & Filter Examples

### 1. Search iPhones under $1000
```bash
curl "http://localhost:3001/api/products/search?q=iPhone&maxPrice=1000&sortBy=price&sortOrder=asc"
```

### 2. Browse featured electronics
```bash
curl "http://localhost:3001/api/products/search?category=electronics&isFeatured=true"
```

### 3. Search by multiple tags
```bash
curl "http://localhost:3001/api/products/search?tags=smartphone,premium&inStock=true"
```

### 4. Price range with brand filter
```bash
curl "http://localhost:3001/api/products/search?brand=Apple&minPrice=500&maxPrice=1500"
```

### 5. Paginated results
```bash
curl "http://localhost:3001/api/products/search?q=laptop&page=2&limit=10"
```

## Testing the Search System

### 1. Set up sample data
```bash
npm run setup-db
```

### 2. Test basic search
```bash
curl "http://localhost:3001/api/products/search?q=iPhone"
```

### 3. Test category filtering
```bash
curl "http://localhost:3001/api/products/search?category=electronics"
```

### 4. Test price filtering
```bash
curl "http://localhost:3001/api/products/search?minPrice=50&maxPrice=100"
```

### 5. Test sorting
```bash
curl "http://localhost:3001/api/products/search?sortBy=price&sortOrder=asc"
```

## Frontend Integration Examples

### React/JavaScript Search Component
```javascript
const searchProducts = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/products/search?${params}`);
  return response.json();
};

// Usage
const results = await searchProducts({
  q: 'iPhone',
  category: 'electronics',
  minPrice: 500,
  maxPrice: 1500,
  sortBy: 'price',
  sortOrder: 'asc',
  page: 1,
  limit: 20
});
```

## Performance Considerations

1. **Firestore Indexes**: Ensure proper indexes for category, brand, price queries
2. **Pagination**: Implement proper pagination to handle large datasets
3. **Caching**: Consider caching frequently accessed data
4. **Image Optimization**: Use CDN for product images
5. **Search Optimization**: Consider implementing Elasticsearch for advanced search

## Security Features

1. **Public Access**: All browsing endpoints are publicly accessible
2. **Admin Protection**: Product/category management requires admin authentication
3. **Input Validation**: All search parameters are validated
4. **Rate Limiting**: Configured rate limiting for API endpoints
5. **Data Sanitization**: User inputs are sanitized and validated

## Next Steps

After implementing Product Browsing and Search:

1. ✅ User Account Management - **COMPLETED**
2. ✅ Product Browsing and Search - **COMPLETED**
3. 🔄 Shopping Cart and Checkout - **NEXT**
4. 🔄 Order Tracking and History
5. 🔄 Admin Product & Inventory Management

The system now provides comprehensive product discovery capabilities with advanced search, filtering, and sorting options suitable for a modern e-commerce platform.
