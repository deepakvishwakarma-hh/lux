import type {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { createLikedProductWorkflow } from "../../../workflows/create-liked-product"
import { deleteLikedProductWorkflow } from "../../../workflows/delete-liked-product"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"

export const CreateLikedProductSchema = z.object({
    product_id: z.string(),
})

export const POST = async (
    req: AuthenticatedMedusaRequest<z.infer<typeof CreateLikedProductSchema>>,
    res: MedusaResponse
) => {
    try {
        const customer_id = req.auth_context?.actor_id

        if (!customer_id) {
            return res.status(401).json({
                message: "Unauthorized",
            })
        }

        const { product_id } = req.validatedBody

        const { result } = await createLikedProductWorkflow(req.scope).run({
            input: {
                customer_id,
                product_id,
            },
        })

        res.json(result)
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : "An error occurred while creating the liked product",
        })
    }
}

export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    try {
        const customer_id = req.auth_context?.actor_id

        if (!customer_id) {
            return res.status(401).json({
                message: "Unauthorized",
            })
        }

        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

        // Get all liked products for this customer

        // @ts-ignore
        const { data: likedProducts } = await query.graph({
            entity: "liked_product",
            filters: {
                customer_id,
            },
        })

        if (!likedProducts || likedProducts.length === 0) {
            return res.json({
                products: [],
                count: 0,
            })
        }

        // Extract product IDs
        const productIds = likedProducts.map((lp: any) => lp.product_id)

        // Fetch products - try array filter first, fallback to individual queries if needed
        let products: any[] = []

        if (productIds.length > 0) {
            try {
                // Try using array filter
                const result = await query.graph({
                    entity: "product",
                    filters: {
                        id: productIds,
                    },
                    fields: [
                        "*",
                        "variants.*",
                        "variants.calculated_price.*",
                        "images.*",
                        "tags.*",
                        "categories.*",
                    ],
                })
                products = result.data || []
            } catch (error) {
                // Fallback: fetch products individually if array filter doesn't work
                console.warn("Array filter failed, fetching products individually:", error)
                const productPromises = productIds.map(async (productId: string) => {
                    try {
                        const result = await query.graph({
                            entity: "product",
                            filters: {
                                id: productId,
                            },
                            fields: [
                                "*",
                                "variants.*",
                                "variants.calculated_price.*",
                                "images.*",
                                "tags.*",
                                "categories.*",
                            ],
                        })
                        return result.data?.[0] || null
                    } catch (err) {
                        console.error(`Error fetching product ${productId}:`, err)
                        return null
                    }
                })

                const fetchedProducts = await Promise.all(productPromises)
                products = fetchedProducts.filter((p) => p !== null)
            }
        }

        return res.json({
            products: products || [],
            count: products?.length || 0,
        })
    } catch (error) {
        console.error("Error fetching liked products:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching liked products",
        })
    }
}

export const DELETE = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    try {
        const customer_id = req.auth_context?.actor_id

        if (!customer_id) {
            return res.status(401).json({
                message: "Unauthorized",
            })
        }

        const product_id = req.query.product_id as string

        if (!product_id) {
            return res.status(400).json({
                message: "product_id is required",
            })
        }

        await deleteLikedProductWorkflow(req.scope).run({
            input: {
                customer_id,
                product_id,
            },
        })

        res.json({ success: true })
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : "An error occurred while deleting the liked product",
        })
    }
}

