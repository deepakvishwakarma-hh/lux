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

        // Parse query parameters manually since we removed middleware validation
        // to avoid 'order' field validation conflict
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 100
        const offset = req.query.offset ? parseInt(req.query.offset as string) : 0

        // Build query config - always use wildcard to get all fields including 'order'
        // The 'order' field name conflicts with query sorting parameter, so we can't validate it
        const queryConfig: any = {
            entity: "carousel",
            fields: ["*"], // Use wildcard to get all fields including 'order' without validation issues
            take: limit,
            skip: offset,
        }

        const {
            data: carousels,
            metadata: { count, take, skip } = {},
        } = await query.graph(queryConfig)

        // Sort by order field (ascending) - this works even if 'order' wasn't explicitly in fields
        // because we're using wildcard or it's in defaults
        const sortedCarousels = (carousels || []).sort((a: any, b: any) => {
            const orderA = a.order ?? 0
            const orderB = b.order ?? 0
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

