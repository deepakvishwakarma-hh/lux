import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductQueryStep } from "./steps/create-product-query"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

type CreateProductQueryInput = {
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

export const createProductQueryWorkflow = createWorkflow(
  "create-product-query",
  (input: CreateProductQueryInput) => {
    // Check product exists
    // @ts-ignore
    useQueryGraphStep({
      entity: "product",
      fields: ["id"],
      filters: {
        id: input.product_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    // Create the product query
    const productQuery = createProductQueryStep(input)

    // @ts-ignore
    return new WorkflowResponse({
      product_query: productQuery,
    })
  }
)

