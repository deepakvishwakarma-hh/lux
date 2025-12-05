import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { createBrandWorkflow } from "../../../workflows/create-brand"
import { z } from "zod"

export const GetAdminBrandsSchema = createFindParams()

export const CreateBrandSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    meta_title: z.string().optional(),
    meta_desc: z.string().optional(),
})

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const query = req.scope.resolve("query")

        const {
            data: brands,
            metadata: { count, take, skip } = {
                count: 0,
                take: 20,
                skip: 0,
            },
        } = await query.graph({
            entity: "brand",
            ...req.queryConfig,
        })

        res.json({
            brands,
            count,
            limit: take,
            offset: skip,
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
        const { name, description, meta_title, meta_desc } = req.validatedBody

        const { result } = await createBrandWorkflow(req.scope).run({
            input: {
                name,
                description,
                meta_title,
                meta_desc,
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

