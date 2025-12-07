import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteLikedProductStep } from "./steps/delete-liked-product"

type DeleteLikedProductInput = {
    customer_id: string
    product_id: string
}

export const deleteLikedProductWorkflow = createWorkflow(
    "delete-liked-product",
    (input: DeleteLikedProductInput) => {
        const result = deleteLikedProductStep(input)

        // @ts-ignore
        return new WorkflowResponse({
            success: true,
        })
    }
)

