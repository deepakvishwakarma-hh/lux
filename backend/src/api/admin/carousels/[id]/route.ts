import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { updateCarouselWorkflow } from "../../../../workflows/update-carousel"
import { deleteCarouselWorkflow } from "../../../../workflows/delete-carousel"
import { z } from "zod"

export const UpdateCarouselSchema = z.object({
    image_url1: z.string().nullable().optional(),
    image_url2: z.string().nullable().optional(),
    link: z.string().nullable().optional(),
    order: z.number().optional(),
})

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    try {
        const query = req.scope.resolve("query")
        const { id } = req.params

        const { data: carousels } = await query.graph({
            entity: "carousel",
            fields: ["*"],
            filters: {
                id,
            },
        })

        if (!carousels || carousels.length === 0) {
            return res.status(404).json({ message: "Carousel not found" })
        }

        res.json({ carousel: carousels[0] })
    } catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "An error occurred while fetching the carousel",
        })
    }
}

export async function PUT(
    req: MedusaRequest<z.infer<typeof UpdateCarouselSchema>>,
    res: MedusaResponse
) {
    try {
        const { id } = req.params
        const { image_url1, image_url2, link, order } = req.validatedBody

        const { result } = await updateCarouselWorkflow(req.scope).run({
            input: {
                id,
                image_url1,
                image_url2,
                link,
                order,
            },
        })

        res.json(result)
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : "An error occurred while updating the carousel",
        })
    }
}

export async function DELETE(
    req: MedusaRequest,
    res: MedusaResponse
) {
    try {
        const { id } = req.params

        await deleteCarouselWorkflow(req.scope).run({
            input: {
                id,
            },
        })

        res.status(200).json({ success: true })
    } catch (error) {
        const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400
        res.status(statusCode).json({
            message: error instanceof Error ? error.message : "An error occurred while deleting the carousel",
        })
    }
}

