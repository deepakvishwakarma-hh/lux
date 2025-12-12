"use client"

/**
 * Client-side utility for managing liked products via API (for logged in users)
 */

function getApiBaseUrl(): string {
  // Try to get from environment variable (for client-side)
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  }
  // Fallback to default
  return "http://localhost:9000"
}

const API_BASE_URL = getApiBaseUrl()

/**
 * Get authorization headers from cookies
 */
function getAuthHeaders(): { authorization: string } | {} {
  if (typeof document === "undefined") {
    return {}
  }

  const cookies = document.cookie.split(";")
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("_medusa_jwt=")
  )

  if (!tokenCookie) {
    return {}
  }

  try {
    const token = tokenCookie.split("=")[1]
    return { authorization: `Bearer ${token}` }
  } catch (error) {
    return {}
  }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  const authHeaders = getAuthHeaders()
  return authHeaders && Object.keys(authHeaders).length > 0
}

/**
 * Add a product to liked products (API call)
 */
export async function addToLikedAPI(productId: string): Promise<boolean> {
  try {
    const authHeaders = getAuthHeaders()
    
    if (!authHeaders || Object.keys(authHeaders).length === 0) {
      return false
    }

    const response = await fetch(`${API_BASE_URL}/store/liked-products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ product_id: productId }),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to like product: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Error adding product to liked:", error)
    return false
  }
}

/**
 * Remove a product from liked products (API call)
 */
export async function removeFromLikedAPI(productId: string): Promise<boolean> {
  try {
    const authHeaders = getAuthHeaders()
    
    if (!authHeaders || Object.keys(authHeaders).length === 0) {
      return false
    }

    const response = await fetch(
      `${API_BASE_URL}/store/liked-products?product_id=${productId}`,
      {
        method: "DELETE",
        headers: {
          ...authHeaders,
        },
        credentials: "include",
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to unlike product: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error("Error removing product from liked:", error)
    return false
  }
}

/**
 * Get liked product IDs from API
 */
export async function getLikedProductIdsFromAPI(): Promise<string[]> {
  try {
    const authHeaders = getAuthHeaders()
    
    if (!authHeaders || Object.keys(authHeaders).length === 0) {
      return []
    }

    const response = await fetch(`${API_BASE_URL}/store/liked-products`, {
      method: "GET",
      headers: {
        ...authHeaders,
      },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch liked products: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.products || data.products.length === 0) {
      return []
    }

    return data.products.map((product: any) => product.id)
  } catch (error) {
    console.error("Error fetching liked products from API:", error)
    return []
  }
}

