export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  createdAt: string
}

export interface Product {
  id?: string
  brand: string
  category: string
  compareAtPrice: number
  createdAt: string
  description: string
  dimensions: {
    height: number
    length: number
    weight: number
    width: number
  }
  images: string[]
  isActive: boolean
  isFeatured: boolean
  name: string
  price: number
  rating: {
    average: number
    count: number
  }
  sku: string
  specifications: {
    battery?: string
    camera?: string
    color?: string
    display?: string
    storage?: string
    [key: string]: any // for other specifications
  }
  stock: number
  tags: string[]
  thumbnail: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  sku?: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress?: Address
  paymentMethod: string
  createdAt: string
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}