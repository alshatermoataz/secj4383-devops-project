import { Request as ExpressRequest } from 'express';

declare global {
  namespace Express {
    interface Request extends ExpressRequest {
      user?: {
        uid: string;
        email?: string;
        role?: string;
        userData?: User;
      };
    }
  }
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number; // Original price for discounts
  category: string;
  brand: string;
  sku?: string;
  stock: number;
  images: string[];
  thumbnail?: string;
  isActive: boolean;
  isFeatured?: boolean;
  tags: string[];
  specifications?: Record<string, any>;
  rating?: {
    average: number;
    count: number;
  };
  dimensions?: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'admin' | 'guest';
  phoneNumber?: string;
  addresses: Address[];
  isActive: boolean;
  profilePicture?: string;
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UserRegistration {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
  };
}

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  displayName?: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  inStock?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface ProductSearchQuery {
  q?: string; // Search query
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  imageUrl?: string;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface EnhancedOrder {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}