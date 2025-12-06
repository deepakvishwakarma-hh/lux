import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createCarouselStep } from "./steps/create-carousel"

type CreateCarouselInput = {
    image_url1?: string
    image_url2?: string
    link?: string
    order?: number
}

export const createCarouselWorkflow = createWorkflow(
    "create-carousel",
    (input: CreateCarouselInput) => {
        const carousel = createCarouselStep(input)

        return new WorkflowResponse({
            carousel,
        })
    }
)

