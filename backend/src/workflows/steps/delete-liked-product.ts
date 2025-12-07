import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { LIKED_PRODUCT_MODULE } from "../../modules/liked_product"
import LikedProductModuleService from "../../modules/liked_product/service"

export type DeleteLikedProductStepInput = {
    customer_id: string
    product_id: string
}

export const deleteLikedProductStep = createStep(
    "delete-liked-product",
    async (input: DeleteLikedProductStepInput, { container }) => {
        const query = container.resolve("query")
        // @ts-ignore
        const { data: likedProducts } = await query.graph({
            entity: "liked_product",
            filters: {
                customer_id: input.customer_id,
                product_id: input.product_id,
            },
        })

        if (!likedProducts || likedProducts.length === 0) {
            return new StepResponse(null, null)
        }

        const likedProductModuleService: LikedProductModuleService = container.resolve(
            LIKED_PRODUCT_MODULE
        )

        await likedProductModuleService.deleteLikedProducts(likedProducts[0].id)

        return new StepResponse({ success: true }, likedProducts[0].id)
    },
    async (likedProductId, { container }) => {
        // Rollback not needed for delete
    }
)

