"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export type Review = {
    id: string
    title: string | null
    content: string
    rating: number
    first_name: string
    last_name: string
    created_at: string
    product_id: string
    customer_id: string | null
}

export type ReviewsResponse = {
    reviews: Review[]
    count: number
    limit: number
    offset: number
    average_rating: number
}

/**
 * Fetch reviews for a product
 */
export async function getProductReviews(
    productId: string,
    options?: {
        limit?: number
        offset?: number
    }
): Promise<ReviewsResponse> {
    const limit = options?.limit || 10
    const offset = options?.offset || 0

    const next = {
        ...(await getCacheOptions("reviews")),
    }

    try {
        const response = await sdk.client.fetch<ReviewsResponse>(
            `/store/products/${productId}/reviews`,
            {
                method: "GET",
                query: {
                    limit,
                    offset,
                },
                next,
                cache: "no-store", // Reviews can change, so don't cache aggressively
            }
        )

        return response || { reviews: [], count: 0, limit, offset, average_rating: 0 }
    } catch (error: any) {
        console.error("[getProductReviews] API Error:", {
            message: error?.message,
            status: error?.status,
            productId,
            error,
        })

        return { reviews: [], count: 0, limit, offset, average_rating: 0 }
    }
}


