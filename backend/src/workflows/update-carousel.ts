import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateCarouselStep } from "./steps/update-carousel"

export type UpdateCarouselInput = {
    id: string
    image_url1?: string | null
    image_url2?: string | null
    link?: string | null
    order?: number
}

export const updateCarouselWorkflow = createWorkflow(
    "update-carousel",
    (input: UpdateCarouselInput) => {
        const carousel = updateCarouselStep(input)

        return new WorkflowResponse({
            carousel,
        })
    }
)

