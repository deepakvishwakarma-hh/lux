import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRODUCT_QUERY_MODULE } from "../../modules/product_query"
import ProductQueryModuleService from "../../modules/product_query/service"

export type CreateProductQueryStepInput = {
  type: "question" | "custom_delivery" | "customize_product"
  product_id: string
  customer_name: string
  customer_email: string
  customer_mobile: string
  subject: string
  message: string
  address: {
    address_1: string
    address_2?: string | null
    city: string
    state?: string | null
    postal_code: string
    country: string
    country_code?: string | null
  }
  status?: "new" | "read" | "responded"
}

export const createProductQueryStep = createStep(
  "create-product-query",
  async (input: CreateProductQueryStepInput, { container }) => {
    const productQueryModuleService: ProductQueryModuleService = container.resolve(
      PRODUCT_QUERY_MODULE
    )

    const productQuery = await productQueryModuleService.createProductQueries(input)

    return new StepResponse(productQuery, productQuery.id)
  },
  async (productQueryId, { container }) => {
    if (!productQueryId) {
      return
    }

    const productQueryModuleService: ProductQueryModuleService = container.resolve(
      PRODUCT_QUERY_MODULE
    )

    await productQueryModuleService.deleteProductQueries(productQueryId)
  }
)

