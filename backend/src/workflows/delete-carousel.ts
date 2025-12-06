import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CAROUSEL_MODULE } from "../modules/carousel"
import CarouselModuleService from "../modules/carousel/service"

const deleteCarouselStep = createStep(
    "delete-carousel",
    async (input: { id: string }, { container }) => {
        const carouselModuleService: CarouselModuleService = container.resolve(
            CAROUSEL_MODULE
        )

        await carouselModuleService.deleteCarousels(input.id)

        return new StepResponse(input.id)
    }
)

export const deleteCarouselWorkflow = createWorkflow(
    "delete-carousel",
    (input: { id: string }) => {
        deleteCarouselStep(input)

        return new WorkflowResponse({
            id: input.id,
        })
    }
)

