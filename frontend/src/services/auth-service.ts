import { post, get } from "@/lib/api"
import type { User } from "@/types"

interface AuthResponse {
  token: string
  customToken?: string
  user: User
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await post<AuthResponse>("/auth/login", { email, password })

  if (error) {
    throw new Error(error)
  }

  if (!data) {
    throw new Error("Login failed")
  }

  // Store token
  localStorage.setItem("token", data.token || data.customToken || "")

  return data
}

export async function register(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
}): Promise<AuthResponse> {
  const { data, error } = await post<AuthResponse>("/auth/register", userData)

  if (error) {
    throw new Error(error)
  }

  if (!data) {
    throw new Error("Registration failed")
  }

  // Store token
  localStorage.setItem("token", data.token || data.customToken || "")

  return data
}

export async function getCurrentUser(): Promise<User | null> {
  // Only run if we have a token
  if (typeof window === 'undefined' || !localStorage.getItem("token")) {
    return null
  }

  const { data, error } = await get<User>("/auth/me")

  if (error || !data) {
    return null
  }

  return data
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("token")
  }
}