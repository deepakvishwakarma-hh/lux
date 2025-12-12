"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getLikedProductIds } from "./liked"

export const getLikedProductsCount = async (): Promise<number> => {
    const headers = await getAuthHeaders()

    // If user is logged in, get from API
    if (headers.authorization) {
        try {
            const next = {
                ...(await getCacheOptions("liked-products")),
            }

            const response = await sdk.client.fetch<{
                products: unknown[]
                count: number
            }>("/store/liked-products", {
                method: "GET",
                headers,
                next,
                cache: "force-cache",
            })

            return response.count || 0
        } catch {
            return 0
        }
    }

    // If user is not logged in, get from cookies
    try {
        const likedIds = await getLikedProductIds()
        return likedIds.length
    } catch {
        return 0
    }
}

