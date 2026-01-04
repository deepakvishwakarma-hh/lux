import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export const GetAdminProductQueriesSchema = createFindParams()

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const query = req.scope.resolve("query")
    
    // Extract filter parameters from query
    const type = req.query.type as string | undefined
    const status = req.query.status as string | undefined
    const email = req.query.email as string | undefined

    // Build filters
    const filters: any = {}
    if (type) {
      filters.type = type
    }
    if (status) {
      filters.status = status
    }
    if (email) {
      filters.customer_email = { $ilike: `%${email}%` }
    }

    const { 
      data: productQueries, 
      metadata: { count, take, skip } = {
        count: 0,
        take: 20,
        skip: 0,
      },
    } = await query.graph({
      entity: "product_query",
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      ...req.queryConfig,
    })

    res.json({ 
      product_queries: productQueries,
      count,
      limit: take,
      offset: skip,
    })
  } catch (error) {
    console.error("Error fetching product queries:", error)
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while fetching product queries",
    })
  }
}

