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
  imageUrl: string;
  stock?: number;
  createdAt?: string;
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