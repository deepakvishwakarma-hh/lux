import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createLikedProductStep } from "./steps/create-liked-product"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

type CreateLikedProductInput = {
    customer_id: string
    product_id: string
}

export const createLikedProductWorkflow = createWorkflow(
    "create-liked-product",
    (input: CreateLikedProductInput) => {
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

        // Create the liked product
        const likedProduct = createLikedProductStep(input)

        // @ts-ignore
        return new WorkflowResponse({
            liked_product: likedProduct,
        })
    }
)

