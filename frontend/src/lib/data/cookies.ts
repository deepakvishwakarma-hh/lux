import "server-only"
import { cookies as nextCookies } from "next/headers"

export const getAuthHeaders = async (): Promise<
  { authorization: string } | {}
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [`${cacheTag}`] }
}

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", "", {
    maxAge: -1,
  })
}

/**
 * Get or create a guest customer ID for non-logged in users
 */
export const getOrCreateGuestCustomerId = async (): Promise<string> => {
  const cookies = await nextCookies()
  let guestCustomerId = cookies.get("_medusa_guest_customer_id")?.value

  if (!guestCustomerId) {
    // Generate a unique guest customer ID
    guestCustomerId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    cookies.set("_medusa_guest_customer_id", guestCustomerId, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
  }

  return guestCustomerId
}

/**
 * Get customer ID - returns logged in customer ID or guest customer ID
 */
export const getCustomerId = async (): Promise<string | null> => {
  const authHeaders = await getAuthHeaders()
  
  // If user is logged in, get customer ID from customer object
  if (authHeaders && Object.keys(authHeaders).length > 0) {
    try {
      const { retrieveCustomer } = await import("./customer")
      const customer = await retrieveCustomer()
      if (customer?.id) {
        return customer.id
      }
    } catch (error) {
      console.error("Error retrieving customer:", error)
    }
  }

  // For guests, use guest customer ID
  return await getOrCreateGuestCustomerId()
}
