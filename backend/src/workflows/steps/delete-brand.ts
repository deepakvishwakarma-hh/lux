import {
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { BRAND_MODULE } from "../../modules/brand"
import BrandModuleService from "../../modules/brand/service"

export type DeleteBrandStepInput = {
    id: string
}

export const deleteBrandStep = createStep(
    "delete-brand-step",
    async (input: DeleteBrandStepInput, { container }) => {
        const brandModuleService: BrandModuleService = container.resolve(
            BRAND_MODULE
        )

        // Get original brand before delete
        const originalBrands = await brandModuleService.listBrands({
            id: [input.id],
        })

        await brandModuleService.deleteBrands(input.id)

        return new StepResponse(undefined, originalBrands[0])
    },
    async (originalData, { container }) => {
        if (!originalData) {
            return
        }

        const brandModuleService: BrandModuleService = container.resolve(
            BRAND_MODULE
        )

        // Restore original brand
        await brandModuleService.createBrands({
            name: originalData.name,
            description: originalData.description,
            meta_title: originalData.meta_title,
            meta_desc: originalData.meta_desc,
        })
    }
)

