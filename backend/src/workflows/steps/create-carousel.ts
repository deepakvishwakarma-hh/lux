import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { CAROUSEL_MODULE } from "../../modules/carousel"
import CarouselModuleService from "../../modules/carousel/service"

export type CreateCarouselStepInput = {
    image_url1?: string
    image_url2?: string
    link?: string
    order?: number
}

export const createCarouselStep = createStep(
    "create-carousel",
    async (input: CreateCarouselStepInput, { container }) => {
        const carouselModuleService: CarouselModuleService = container.resolve(
            CAROUSEL_MODULE
        )

        const carousel = await carouselModuleService.createCarousels(input)

        return new StepResponse(carousel, carousel.id)
    },
    async (carouselId, { container }) => {
        if (!carouselId) {
            return
        }

        const carouselModuleService: CarouselModuleService = container.resolve(
            CAROUSEL_MODULE
        )

        await carouselModuleService.deleteCarousels(carouselId)
    }
)

