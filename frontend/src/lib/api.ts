const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem("token")
        if (window.location.pathname !== "/login") {
          window.location.href = "/login"
        }
      }
      throw new Error(data.error || data.message || "An error occurred")
    }

    return { data }
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  return fetchWithAuth<T>(endpoint)
}

export async function post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
  return fetchWithAuth<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
  return fetchWithAuth<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  return fetchWithAuth<T>(endpoint, {
    method: "DELETE",
  })
}