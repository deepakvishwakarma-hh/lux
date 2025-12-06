import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { CAROUSEL_MODULE } from "../../modules/carousel"
import CarouselModuleService from "../../modules/carousel/service"

export type UpdateCarouselStepInput = {
    id: string
    image_url1?: string | null
    image_url2?: string | null
    link?: string | null
    order?: number
}

export const updateCarouselStep = createStep(
    "update-carousel-step",
    async (input: UpdateCarouselStepInput, { container }) => {
        const carouselModuleService: CarouselModuleService = container.resolve(
            CAROUSEL_MODULE
        )

        // Get original carousel before update
        const originalCarousels = await carouselModuleService.listCarousels({
            id: [input.id],
        })

        const carousel = await carouselModuleService.updateCarousels(input)

        return new StepResponse(carousel, originalCarousels[0])
    },
    async (originalData, { container }) => {
        if (!originalData) {
            return
        }

        const carouselModuleService: CarouselModuleService = container.resolve(
            CAROUSEL_MODULE
        )

        // Restore original carousel data
        await carouselModuleService.updateCarousels({
            id: originalData.id,
            image_url1: originalData.image_url1,
            image_url2: originalData.image_url2,
            link: originalData.link,
            order: originalData.order,
        })
    }
)

