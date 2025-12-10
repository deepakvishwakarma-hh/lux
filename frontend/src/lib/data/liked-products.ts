"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export const getLikedProductsCount = async (): Promise<number> => {
    const headers = await getAuthHeaders()

    if (!headers.authorization) {
        return 0
    }

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

