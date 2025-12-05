import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createReviewWorkflow } from "../../../workflows/create-review"
import { hasReviewWorkflow } from "../../../workflows/has-review"

import { z } from "zod"

export const PostStoreReviewSchema = z.object({
  title: z.string().optional(),
  content: z.string(),
  rating: z.preprocess(
    (val) => {
      if (val && typeof val === "string") {
        return parseInt(val)
      }
      return val
    },
    z.number().min(1).max(5)
  ),
  product_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
})

type PostStoreReviewReq = z.infer<typeof PostStoreReviewSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest<PostStoreReviewReq>,
  res: MedusaResponse
) => {
  const input = req.validatedBody

  const { result } = await createReviewWorkflow(req.scope)
    .run({
      input: {
        ...input,
        customer_id: req.auth_context?.actor_id,
      },
    })

  res.json(result)
}




export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { result } = await hasReviewWorkflow(req.scope)
    .run({
      input: {
        //@ts-ignore
        customer_id: req.query.customer_id,
        //@ts-ignore
        product_id: req.query.product_id,
      },
    })
  res.json(result.reviews ?? [])
}
