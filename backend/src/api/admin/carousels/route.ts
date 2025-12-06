import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { createCarouselWorkflow } from "../../../workflows/create-carousel"
import { z } from "zod"

export const GetAdminCarouselsSchema = createFindParams()

export const CreateCarouselSchema = z.object({
    image_url1: z.string().optional(),
    image_url2: z.string().optional(),
    link: z.string().optional(),
    order: z.number().optional(),
})

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const query = req.scope.resolve("query")

        const queryConfig = {
            entity: "carousel",
            ...req.queryConfig, // allows pagination & field overrides
        }

        const {
            data: carousels,
            metadata: { count, take, skip } = {},
        } = await query.graph(queryConfig)

        return res.json({
            carousels: carousels || [],
            count: count || 0,
            limit: take,
            offset: skip,
        })
    } catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching carousels",
        })
    }
}

export const POST = async (
    req: MedusaRequest<z.infer<typeof CreateCarouselSchema>>,
    res: MedusaResponse
) => {
    // try {
    const { image_url1, image_url2, link, order } = req.validatedBody

    const { result } = await createCarouselWorkflow(req.scope).run({
        input: {
            image_url1,
            image_url2,
            link,
            order,
        },
    })

    res.json(result)
    // } catch (error) {
    //     const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
    //     res.status(statusCode).json({
    //         message: error instanceof Error ? error.message : "An error occurred while creating the carousel",
    //     })
    // }
}

