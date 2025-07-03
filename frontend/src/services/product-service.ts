import { get } from "@/lib/api"
import type { Product } from "@/types"

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await get<Product[]>("/products/featured")

  if (error) {
    throw new Error(error)
  }

  return data || []
}

export async function getProductById(id: string): Promise<Product> {
  const { data, error } = await get<Product>(`/products/${id}`)

  if (error) {
    throw new Error(error)
  }

  if (!data) {
    throw new Error("Product not found")
  }

  return data
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`)

  if (error) {
    throw new Error(error)
  }

  return data || []
}