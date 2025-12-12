import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { createLikedProductWorkflow } from "../../../workflows/create-liked-product"
import { deleteLikedProductWorkflow } from "../../../workflows/delete-liked-product"
import { getLikedProductsWorkflow } from "../../../workflows/get-liked-products"
import { z } from "zod"

export const CreateLikedProductSchema = z.object({
    product_id: z.string(),
})

export const POST = async (
    req: MedusaRequest<z.infer<typeof CreateLikedProductSchema>>,
    res: MedusaResponse
) => {
    try {
        const customer_id = req.query.customer_id as string

        if (!customer_id) {
            return res.status(400).json({
                message: "customer_id is required",
            })
        }

        // Use validatedBody if available, otherwise fallback to body
        const body = req.validatedBody || req.body
        const product_id = body?.product_id

        if (!product_id) {
            return res.status(400).json({
                message: "product_id is required",
            })
        }

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
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const customer_id = req.query.customer_id as string

        if (!customer_id) {
            return res.status(400).json({
                message: "customer_id is required",
            })
        }

        const { result } = await getLikedProductsWorkflow(req.scope).run({
            input: {
                customer_id,
            },
        })

        const likedProducts = result.liked_products || []

        if (!likedProducts || likedProducts.length === 0) {
            return res.json({
                product_ids: [],
                count: 0,
            })
        }

        // Extract product IDs only, filtering out any undefined/null values
        const productIds = likedProducts
            .filter((lp: any) => lp && lp.product_id)
            .map((lp: any) => lp.product_id)

        return res.json({
            product_ids: productIds,
            count: productIds.length,
        })
    } catch (error) {
        console.error("Error fetching liked products:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching liked products",
        })
    }
}

export const DELETE = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const customer_id = req.query.customer_id as string

        if (!customer_id) {
            return res.status(400).json({
                message: "customer_id is required",
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

