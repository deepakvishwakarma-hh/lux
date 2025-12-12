import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { getLikedProductsStep } from "./steps/get-liked-products"

type GetLikedProductsInput = {
    customer_id: string
}

export const getLikedProductsWorkflow = createWorkflow(
    "get-liked-products",
    (input: GetLikedProductsInput) => {
        const result = getLikedProductsStep(input)

        // @ts-ignore
        return new WorkflowResponse({
            liked_products: result.liked_products,
            count: result.count,
        })
    }
)

