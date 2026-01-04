import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "zod"
import { PRODUCT_QUERY_MODULE } from "../../../../modules/product_query"
import ProductQueryModuleService from "../../../../modules/product_query/service"

export const UpdateProductQueryStatusSchema = z.object({
  status: z.enum(["new", "read", "responded"]),
})

export const PATCH = async (
  req: MedusaRequest<z.infer<typeof UpdateProductQueryStatusSchema>>,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params
    const { status } = req.validatedBody

    const productQueryModuleService: ProductQueryModuleService = req.scope.resolve(
      PRODUCT_QUERY_MODULE
    )

    await productQueryModuleService.updateProductQueries({
      id,
      status,
    })

    res.json({
      id,
      status,
    })
  } catch (error) {
    console.error("Error updating product query status:", error)
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while updating product query status",
    })
  }
}

export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params

    const productQueryModuleService: ProductQueryModuleService = req.scope.resolve(
      PRODUCT_QUERY_MODULE
    )

    await productQueryModuleService.deleteProductQueries(id)

    res.json({
      id,
      deleted: true,
    })
  } catch (error) {
    console.error("Error deleting product query:", error)
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while deleting product query",
    })
  }
}

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const { id } = req.params
    const query = req.scope.resolve("query")

    const { data: productQueries } = await query.graph({
      entity: "product_query",
      fields: [
        "id",
        "type",
        "product_id",
        "customer_name",
        "customer_email",
        "customer_mobile",
        "subject",
        "message",
        "address",
        "status",
        "created_at",
        "updated_at",
      ],
      filters: {
        id,
      },
    })

    if (!productQueries || productQueries.length === 0) {
      return res.status(404).json({
        message: "Product query not found",
      })
    }

    res.json({
      product_query: productQueries[0],
    })
  } catch (error) {
    console.error("Error fetching product query:", error)
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while fetching product query",
    })
  }
}

