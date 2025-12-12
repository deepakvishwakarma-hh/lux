import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"

export type GetLikedProductsStepInput = {
    customer_id: string
}

export const getLikedProductsStep = createStep(
    "get-liked-products",
    async (input: GetLikedProductsStepInput, { container }) => {
        const query = container.resolve("query")

        // @ts-ignore
        const result = await query.graph({
            entity: "liked_product",
            fields: ["*"],
            filters: {
                customer_id: input.customer_id,
                deleted_at: null, // Exclude soft-deleted records
            },
        })

        const likedProducts = (result?.data || []).filter(
            (lp: any) => lp !== null && lp !== undefined
        )

        return new StepResponse({
            liked_products: likedProducts,
            count: likedProducts.length,
        })
    }
)

