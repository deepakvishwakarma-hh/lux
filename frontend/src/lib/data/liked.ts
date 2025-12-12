import "server-only"
import { cookies as nextCookies } from "next/headers"
import { getCustomerId } from "./cookies"
import { sdk } from "@lib/config"

const LIKED_COOKIE_NAME = "_medusa_liked_ids"

/**
 * Get liked product IDs from cookies (server-side) - fallback for legacy support
 */
export async function getLikedProductIds(): Promise<string[]> {
  try {
    const cookies = await nextCookies()
    const likedCookie = cookies.get(LIKED_COOKIE_NAME)?.value

    if (!likedCookie) {
      return []
    }

    try {
      const decoded = decodeURIComponent(likedCookie)
      const ids = JSON.parse(decoded)
      return Array.isArray(ids) ? ids : []
    } catch (error) {
      console.error("Error parsing liked cookie:", error)
      return []
    }
  } catch (error) {
    console.error("Error reading liked cookie:", error)
    return []
  }
}

/**
 * Get liked product IDs from backend API using customer_id
 */
export async function getLikedProductIdsFromAPI(customerId?: string): Promise<string[]> {
  try {
    const customer_id = customerId || await getCustomerId()

    if (!customer_id) {
      return []
    }

    const response = await sdk.client.fetch<{ product_ids: string[]; count: number }>(
      `/store/liked-products?customer_id=${encodeURIComponent(customer_id)}`,
      {
        method: "GET",
      }
    )

    if (!response.product_ids || response.product_ids.length === 0) {
      return []
    }

    // Return product IDs directly
    return response.product_ids
  } catch (error) {
    console.error("Error fetching liked products from API:", error)
    return []
  }
}

/**
 * Get all liked product IDs (uses API with customer_id - works for both logged in and guest users)
 */
export async function getAllLikedProductIds(): Promise<string[]> {
  try {
    const customerId = await getCustomerId()
    if (customerId) {
      return await getLikedProductIdsFromAPI(customerId)
    }
    // Fallback to cookies if customer ID cannot be determined
    return await getLikedProductIds()
  } catch (error) {
    console.error("Error getting liked product IDs:", error)
    // Fallback to cookies on error
    return await getLikedProductIds()
  }
}

