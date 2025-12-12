"use client"

/**
 * Client-side utility for managing liked products via API
 */

import { sdk } from "@lib/config"

const GUEST_CUSTOMER_ID_COOKIE = "_medusa_guest_customer_id"

/**
 * Get or create a guest customer ID for non-logged in users (client-side)
 */
function getOrCreateGuestCustomerId(): string {
  if (typeof document === "undefined") {
    return ""
  }

  const cookies = document.cookie.split(";")
  const guestIdCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${GUEST_CUSTOMER_ID_COOKIE}=`)
  )

  if (guestIdCookie) {
    try {
      return guestIdCookie.split("=")[1]
    } catch {
      // Continue to create new one
    }
  }

  // Generate a unique guest customer ID
  const guestCustomerId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  document.cookie = `${GUEST_CUSTOMER_ID_COOKIE}=${guestCustomerId}; max-age=${maxAge}; path=/; SameSite=Strict`

  return guestCustomerId
}

/**
 * Get customer ID - returns logged in customer ID or guest customer ID
 */
async function getCustomerId(): Promise<string | null> {
  try {
    // Try to get customer info if logged in
    const authHeaders = getAuthHeaders()
    if (authHeaders && Object.keys(authHeaders).length > 0) {
      try {
        const { customer } = await sdk.client.fetch<{ customer: { id: string } }>(
          `/store/customers/me`,
          {
            method: "GET",
            headers: authHeaders,
          }
        )
        if (customer?.id) {
          return customer.id
        }
      } catch (error) {
        // Not logged in or error, continue to guest
      }
    }

    // For guests, use guest customer ID
    return getOrCreateGuestCustomerId()
  } catch (error) {
    console.error("Error getting customer ID:", error)
    // Fallback to guest ID
    return getOrCreateGuestCustomerId()
  }
}

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
    const customerId = await getCustomerId()

    if (!customerId) {
      console.error("Unable to get customer ID")
      return false
    }

    await sdk.client.fetch(
      `/store/liked-products?customer_id=${encodeURIComponent(customerId)}`,
      {
        method: "POST",
        body: { product_id: productId },
      }
    )

    // Dispatch custom event for other components to listen
    if (typeof window !== "undefined") {
      // Fetch updated count to dispatch with event
      const updatedIds = await getLikedProductIdsFromAPI()
      window.dispatchEvent(
        new CustomEvent("likedUpdated", { detail: { count: updatedIds.length } })
      )
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
    const customerId = await getCustomerId()

    if (!customerId) {
      console.error("Unable to get customer ID")
      return false
    }

    await sdk.client.fetch(
      `/store/liked-products?customer_id=${encodeURIComponent(customerId)}&product_id=${encodeURIComponent(productId)}`,
      {
        method: "DELETE",
      }
    )

    // Dispatch custom event for other components to listen
    if (typeof window !== "undefined") {
      // Fetch updated count to dispatch with event
      const updatedIds = await getLikedProductIdsFromAPI()
      window.dispatchEvent(
        new CustomEvent("likedUpdated", { detail: { count: updatedIds.length } })
      )
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
    const customerId = await getCustomerId()

    if (!customerId) {
      return []
    }

    const data = await sdk.client.fetch<{ product_ids: string[]; count: number }>(
      `/store/liked-products?customer_id=${encodeURIComponent(customerId)}`,
      {
        method: "GET",
      }
    )

    if (!data.product_ids || data.product_ids.length === 0) {
      return []
    }

    return data.product_ids
  } catch (error) {
    console.error("Error fetching liked products from API:", error)
    return []
  }
}

