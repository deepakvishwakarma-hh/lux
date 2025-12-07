import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { createLikedProductWorkflow } from "../../../workflows/create-liked-product"
import { z } from "zod"

export const GetAdminLikedProductsSchema = createFindParams()

export const CreateLikedProductSchema = z.object({
    customer_id: z.string().min(1),
    product_id: z.string().min(1),
})

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const query = req.scope.resolve("query")
        const queryConfig = req.queryConfig || req.query || {}

        const {
            data: likedProducts,
            metadata: { count, take, skip } = {},
        } = await query.graph({
            entity: "liked_product",
            ...queryConfig,
        })

        return res.json({
            liked_products: likedProducts || [],
            count: count || 0,
            limit: take,
            offset: skip,
        })
    } catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching liked products",
        })
    }
}

export const POST = async (
    req: MedusaRequest<z.infer<typeof CreateLikedProductSchema>>,
    res: MedusaResponse
) => {
    try {
        const body = req.validatedBody || req.body

        if (!body || !body.customer_id || !body.product_id) {
            return res.status(400).json({
                message: "customer_id and product_id are required",
            })
        }

        const { customer_id, product_id } = body

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

