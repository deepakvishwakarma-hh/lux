import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../../modules/brand"
import { z } from "zod"
import { container } from "@medusajs/framework"
import { LinkDefinition } from "@medusajs/framework/types"

export const LinkBrandProductsSchema = z.object({
    product_ids: z.array(z.string()),
})

export async function POST(
    req: MedusaRequest<z.infer<typeof LinkBrandProductsSchema>>,
    res: MedusaResponse
) {
    try {
        const { id } = req.params
        const { product_ids } = req.validatedBody

        const link = container.resolve(ContainerRegistrationKeys.LINK)
        const links: LinkDefinition[] = []

        for (const product of product_ids) {
            links.push({
                [Modules.PRODUCT]: {
                    product_id: product,
                },
                [BRAND_MODULE]: {
                    brand_id: id,
                },
            })
        }

        await link.create(links)

        res.json({ success: true })
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : "An error occurred while linking products to the brand",
        })
    }
}

export async function DELETE(
    req: MedusaRequest,
    res: MedusaResponse
) {
    try {
        const { id } = req.params
        const productId = req.query.product_id as string
        const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

        if (!productId) {
            return res.status(400).json({ message: "product_id is required" })
        }

        // Unlink product from brand
        await link.delete({
            [BRAND_MODULE]: {
                brand_id: id,
            },
            [Modules.PRODUCT]: {
                product_id: productId,
            },
        })

        res.json({ success: true })
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : "An error occurred while unlinking the product from the brand",
        })
    }
}

