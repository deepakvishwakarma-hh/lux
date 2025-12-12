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
        console.log("Delete liked product step - Input:", { customer_id: input.customer_id, product_id: input.product_id })

        const query = container.resolve("query")
        // @ts-ignore
        // Use same query pattern as create step
        const result = await query.graph({
            entity: "liked_product",
            fields: ["*"], // Specify fields like in create step
            filters: {
                customer_id: input.customer_id,
                product_id: input.product_id,
            },
        })

        console.log("Query result:", {
            hasData: !!result?.data,
            dataLength: result?.data?.length || 0,
            firstItem: result?.data?.[0],
            fullResult: JSON.stringify(result, null, 2)
        })

        const likedProducts = result?.data || []
        console.log("Raw likedProducts array:", likedProducts)
        console.log("LikedProducts length:", likedProducts.length)

        // Filter out null/undefined values and soft-deleted records
        const validLikedProducts = likedProducts.filter((lp: any) => {
            const isValid = lp !== null &&
                lp !== undefined &&
                lp.id &&
                (!lp.deleted_at || lp.deleted_at === null) // Exclude soft-deleted
            if (!isValid) {
                console.log("Filtered out invalid/deleted item:", lp)
            }
            return isValid
        })

        console.log("Valid liked products after filtering:", validLikedProducts.length)
        if (validLikedProducts.length > 0) {
            console.log("First valid liked product:", JSON.stringify(validLikedProducts[0], null, 2))
        }

        if (!validLikedProducts || validLikedProducts.length === 0) {
            // If not found, it might already be deleted - return success since the goal is achieved
            console.log("Liked product not found - may already be deleted")
            return new StepResponse({ success: true, message: "Liked product not found (may already be deleted)" }, null)
        }

        const likedProduct = validLikedProducts[0]

        if (!likedProduct) {
            console.error("No valid liked product found after filtering")
            return new StepResponse({ success: false, message: "Liked product not found" }, null)
        }

        const likedProductId = likedProduct.id

        if (!likedProductId) {
            console.error("Liked product found but missing ID:", likedProduct)
            return new StepResponse({ success: false, message: "Liked product ID is missing" }, null)
        }

        const likedProductModuleService: LikedProductModuleService = container.resolve(
            LIKED_PRODUCT_MODULE
        )

        try {
            console.log("Deleting liked product with ID:", likedProductId)
            // deleteLikedProducts accepts a single ID (as seen in create-liked-product step rollback)
            await likedProductModuleService.deleteLikedProducts(likedProductId)

            return new StepResponse({ success: true, message: "Liked product deleted successfully" }, likedProductId)
        } catch (error) {
            console.error("Error in deleteLikedProductStep:", error)
            console.error("Attempted to delete liked product ID:", likedProductId)
            throw new Error(`Failed to delete liked product: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
    },
    async (likedProductId, { container }) => {
        // Rollback not needed for delete
    }
)

