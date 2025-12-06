import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export const GetStoreCarouselsSchema = createFindParams()

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const query = req.scope.resolve("query")

        const queryConfig = {
            entity: "carousel",
            ...req.queryConfig, // includes fields, pagination, etc. from middleware
        }

        const {
            data: carousels,
            metadata: { count, take, skip } = {},
        } = await query.graph(queryConfig)

        // Sort by order field (ascending)
        const sortedCarousels = (carousels || []).sort((a: any, b: any) => {
            const orderA = a.order || 0
            const orderB = b.order || 0
            return orderA - orderB
        })

        return res.json({
            carousels: sortedCarousels,
            count: count || 0,
            limit: take,
            offset: skip,
        })
    } catch (error) {
        console.error("Error fetching carousels:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching carousels",
        })
    }
}

