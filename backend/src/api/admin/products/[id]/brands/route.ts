import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../../modules/brand"
import { z } from "zod"

export const LinkProductBrandsSchema = z.object({
    brand_ids: z.array(z.string()),
})

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    try {
        const { id } = req.params
        const query = req.scope.resolve("query")
        const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" })
        }

        // Use query.graph to query the link entity directly
        // The link entity name is typically the combination of the two modules
        // Try querying links using the query service
        let brandIds: string[] = []
        
        try {
            // Try to query links directly using query.graph
            // The link table might be accessible via a specific entity name
            // Common patterns: "link", "product_brand", etc.
            const linkEntityName = `${Modules.PRODUCT}_${BRAND_MODULE}`.replace(/[^a-zA-Z0-9_]/g, "_")
            
            try {
                const { data: links } = await query.graph({
                    entity: linkEntityName,
                    fields: ["*"],
                    filters: {
                        [`${Modules.PRODUCT}_product_id`]: id,
                    },
                })
                
                if (links && Array.isArray(links)) {
                    brandIds = links
                        .map((linkItem: any) => linkItem[`${BRAND_MODULE}_brand_id`] || linkItem.brand_id)
                        .filter(Boolean)
                }
            } catch (linkQueryError) {
                // If direct link query doesn't work, use alternative method
                // Query all brands with their products, then filter
                const { data: allBrands } = await query.graph({
                    entity: "brand",
                    fields: ["*", "products.*"],
                })
                
                if (allBrands && allBrands.length > 0) {
                    // Filter brands that have this product in their products array
                    const linkedBrandsData = allBrands.filter((brand: any) => {
                        return brand.products && Array.isArray(brand.products) && 
                               brand.products.some((p: any) => p.id === id)
                    })
                    
                    brandIds = linkedBrandsData.map((brand: any) => brand.id)
                }
            }
        } catch (error) {
            console.error("Error querying links:", error)
        }

        // Fetch brand details for linked brands
        let linkedBrands: any[] = []
        if (brandIds.length > 0) {
            const { data: brands } = await query.graph({
                entity: "brand",
                fields: ["*"],
                filters: {
                    id: brandIds,
                },
            })
            linkedBrands = brands || []
        }

        res.json({
            product_id: id,
            brands: linkedBrands,
        })
    } catch (error) {
        console.error("Error fetching product brands:", error)
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching product brands",
        })
    }
}

export async function POST(
    req: MedusaRequest<z.infer<typeof LinkProductBrandsSchema>>,
    res: MedusaResponse
) {
    try {
        const { id } = req.params
        const { brand_ids } = req.validatedBody
        const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" })
        }

        const links = brand_ids.map((brandId) => ({
            [Modules.PRODUCT]: {
                product_id: id,
            },
            [BRAND_MODULE]: {
                brand_id: brandId,
            },
        }))

        await link.create(links)

        res.json({ success: true })
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : "An error occurred while linking brands to the product",
        })
    }
}

export async function DELETE(
    req: MedusaRequest,
    res: MedusaResponse
) {
    try {
        const { id } = req.params
        const brandId = req.query.brand_id as string
        const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" })
        }

        if (!brandId) {
            return res.status(400).json({ message: "brand_id is required" })
        }

        // Unlink brand from product
        await link.delete({
            [Modules.PRODUCT]: {
                product_id: id,
            },
            [BRAND_MODULE]: {
                brand_id: brandId,
            },
        })

        res.json({ success: true })
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : "An error occurred while unlinking the brand from the product",
        })
    }
}

