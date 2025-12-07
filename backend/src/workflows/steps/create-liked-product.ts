import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { LIKED_PRODUCT_MODULE } from "../../modules/liked_product"
import LikedProductModuleService from "../../modules/liked_product/service"

export type CreateLikedProductStepInput = {
    customer_id: string
    product_id: string
}

export const createLikedProductStep = createStep(
    "create-liked-product",
    async (input: CreateLikedProductStepInput, { container }) => {
        const likedProductModuleService: LikedProductModuleService = container.resolve(
            LIKED_PRODUCT_MODULE
        )

        // Check if already exists
        const query = container.resolve("query")
        const { data: existing } = await query.graph({
            entity: "liked_product",
            fields: ["*"],
            filters: {
                customer_id: input.customer_id,
                product_id: input.product_id,
            },
        })

        if (existing && existing.length > 0) {
            return new StepResponse(existing[0], existing[0].id)
        }

        const likedProducts = await likedProductModuleService.createLikedProducts(input)
        const likedProduct = Array.isArray(likedProducts) ? likedProducts[0] : likedProducts

        return new StepResponse(likedProduct, likedProduct.id)
    },
    async (likedProductId, { container }) => {
        if (!likedProductId) {
            return
        }

        const likedProductModuleService: LikedProductModuleService = container.resolve(
            LIKED_PRODUCT_MODULE
        )

        await likedProductModuleService.deleteLikedProducts(likedProductId)
    }
)

