"use client"

/**
 * Client-side utility for managing liked product IDs in cookies
 */

const LIKED_COOKIE_NAME = "_medusa_liked_ids"

/**
 * Get liked product IDs from cookies
 */
export function getLikedProductIds(): string[] {
    if (typeof document === "undefined") {
        return []
    }

    const cookies = document.cookie.split(";")
    const likedCookie = cookies.find((cookie) =>
        cookie.trim().startsWith(`${LIKED_COOKIE_NAME}=`)
    )

    if (!likedCookie) {
        return []
    }

    try {
        const value = likedCookie.split("=")[1]
        const decoded = decodeURIComponent(value)
        const ids = JSON.parse(decoded)
        return Array.isArray(ids) ? ids : []
    } catch (error) {
        console.error("Error parsing liked cookie:", error)
        return []
    }
}

/**
 * Set liked product IDs in cookies
 */
export function setLikedProductIds(ids: string[]): void {
    if (typeof document === "undefined") {
        return
    }

    try {
        const encoded = encodeURIComponent(JSON.stringify(ids))
        const maxAge = 60 * 60 * 24 * 7 // 7 days
        document.cookie = `${LIKED_COOKIE_NAME}=${encoded}; max-age=${maxAge}; path=/; SameSite=Strict`

        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent("likedUpdated", { detail: { count: ids.length } }))
    } catch (error) {
        console.error("Error setting liked cookie:", error)
    }
}

/**
 * Add a product ID to liked products
 */
export function addToLiked(productId: string): void {
    const currentIds = getLikedProductIds()
    if (!currentIds.includes(productId)) {
        setLikedProductIds([...currentIds, productId])
    }
}

/**
 * Remove a product ID from liked products
 */
export function removeFromLiked(productId: string): void {
    const currentIds = getLikedProductIds()
    setLikedProductIds(currentIds.filter((id) => id !== productId))
}

/**
 * Check if a product is liked
 */
export function isLiked(productId: string): boolean {
    const currentIds = getLikedProductIds()
    return currentIds.includes(productId)
}

/**
 * Get count of liked products
 */
export function getLikedCount(): number {
    return getLikedProductIds().length
}

