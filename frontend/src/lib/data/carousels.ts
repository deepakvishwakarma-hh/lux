"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type Carousel = {
    id: string
    image_url1?: string | null
    image_url2?: string | null
    link?: string | null
    order: number
    created_at?: Date
    updated_at?: Date
}

export const listCarousels = async (query?: Record<string, any>) => {
    const next = {
        ...(await getCacheOptions("carousels")),
    }

    const limit = query?.limit || 100
    const offset = query?.offset || 0

    return sdk.client
        .fetch<{ carousels: Carousel[]; count: number; limit: number; offset: number }>(
            "/store/carousels",
            {
                query: {
                    limit,
                    offset,
                    ...query,
                },
                next,
                cache: "no-store", // Don't cache to see fresh data
            }
        )
        .then(({ carousels, count }) => {
            return {
                carousels: carousels || [],
                count: count || 0,
            }
        })
        .catch((error) => {
            console.error("Error fetching carousels:", error)
            return {
                carousels: [],
                count: 0,
            }
        })
}

