import "server-only"
import { cookies as nextCookies } from "next/headers"
import { getAuthHeaders } from "./cookies"
import { sdk } from "@lib/config"

const LIKED_COOKIE_NAME = "_medusa_liked_ids"

/**
 * Get liked product IDs from cookies (server-side)
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
 * Get liked product IDs from backend API (for logged in users)
 */
export async function getLikedProductIdsFromAPI(): Promise<string[]> {
  try {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders || Object.keys(authHeaders).length === 0) {
      // User is not logged in, return empty array
      return []
    }

    const response = await sdk.client.fetch<{ products: any[]; count: number }>(
      `/store/liked-products`,
      {
        method: "GET",
        headers: authHeaders,
      }
    )

    if (!response.products || response.products.length === 0) {
      return []
    }

    // Extract product IDs from the products array
    return response.products.map((product: any) => product.id)
  } catch (error) {
    console.error("Error fetching liked products from API:", error)
    return []
  }
}

/**
 * Get all liked product IDs (checks API first if logged in, then cookies)
 */
export async function getAllLikedProductIds(): Promise<string[]> {
  const authHeaders = await getAuthHeaders()

  // If user is logged in, get from API
  if (authHeaders && Object.keys(authHeaders).length > 0) {
    return await getLikedProductIdsFromAPI()
  }

  // Otherwise, get from cookies
  return await getLikedProductIds()
}

