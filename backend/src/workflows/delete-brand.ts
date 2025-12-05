import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteBrandStep } from "./steps/delete-brand"

export type DeleteBrandInput = {
    id: string
}

export const deleteBrandWorkflow = createWorkflow(
    "delete-brand",
    (input: DeleteBrandInput) => {
        deleteBrandStep(input)

        return new WorkflowResponse({
            success: true,
        })
    }
)

