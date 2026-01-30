import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { createBrandWorkflow } from "../../../workflows/create-brand"
import { getBrandsWorkflow } from "../../../workflows/get-brands"
import { z } from "zod"

export const GetAdminBrandsSchema = createFindParams().extend({
    search: z.string().optional(),
})

export const CreateBrandSchema = z.object({
    name: z.string().min(1),
    title: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    meta_title: z.string().optional(),
    meta_desc: z.string().optional(),
    image_url: z.string().optional(),
})

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        // Use queryConfig if available, otherwise use raw query parameters
        const queryConfig = req.queryConfig || req.query || {}
        
        // Get search query parameter from validated query or raw query
        const searchQuery = (req.queryConfig as any)?.search || req.query.search as string | undefined

        // const { result } = await getBrandsWorkflow(req.scope).run({
        //     input: {
        //         queryConfig,
        //     },
        // })
        const query = req.scope.resolve("query")

        // Build query config - if search is provided, we'll filter after fetching
        // since query.graph might not support partial text matching easily
        const graphQueryConfig: any = {
            entity: "brand",
            // This will return brand data and its linked products
            ...req.queryConfig, // allows pagination & field overrides
            // If you want to force fields explicitly instead of using req.queryConfig:
        }

        // If search is provided, fetch all brands for filtering (remove pagination)
        // This allows us to search across all brands, then apply pagination after filtering
        if (searchQuery) {
            delete graphQueryConfig.take
            delete graphQueryConfig.skip
            // Also remove from pagination object if it exists
            if (graphQueryConfig.pagination) {
                delete graphQueryConfig.pagination.take
                delete graphQueryConfig.pagination.skip
            }
        }

        const {
            data: brands,
            metadata: { count, take, skip } = {},
        } = await query.graph(graphQueryConfig)

        // Filter by search query if provided
        let filteredBrands = brands || []
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase().trim()
            filteredBrands = filteredBrands.filter((brand: any) => {
                const nameMatch = brand.name?.toLowerCase().includes(searchLower)
                const titleMatch = brand.title?.toLowerCase().includes(searchLower)
                const slugMatch = brand.slug?.toLowerCase().includes(searchLower)
                return nameMatch || titleMatch || slugMatch
            })
        }

        // Sort brands by name (a-z) by default
        filteredBrands = filteredBrands.sort((a: any, b: any) => {
            const nameA = (a.name || "").toLowerCase()
            const nameB = (b.name || "").toLowerCase()
            return nameA.localeCompare(nameB)
        })

        // Apply pagination
        let paginatedBrands = filteredBrands
        let totalCount = filteredBrands.length
        let finalTake = take || 15
        let finalSkip = skip || 0

        if (searchQuery) {
            // When searching, use pagination from queryConfig or defaults
            finalTake = queryConfig.pagination?.take || (req.query.limit ? parseInt(req.query.limit as string) : 15)
            finalSkip = queryConfig.pagination?.skip || (req.query.offset ? parseInt(req.query.offset as string) : 0)
            paginatedBrands = filteredBrands.slice(finalSkip, finalSkip + finalTake)
            totalCount = filteredBrands.length
        } else {
            totalCount = count || 0
        }

        return res.json({
            brands: paginatedBrands,
            count: totalCount,
            limit: finalTake,
            offset: finalSkip,
        })
    } catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching brands",
        })
    }
}

export const POST = async (
    req: MedusaRequest<z.infer<typeof CreateBrandSchema>>,
    res: MedusaResponse
) => {
    try {
        const { name, title, slug, description, meta_title, meta_desc, image_url } = req.validatedBody

        const { result } = await createBrandWorkflow(req.scope).run({
            input: {
                name,
                title,
                slug,
                description,
                meta_title,
                meta_desc,
                image_url,
            },
        })

        res.json(result)
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : "An error occurred while creating the brand",
        })
    }
}

