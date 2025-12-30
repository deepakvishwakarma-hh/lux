import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { retrieveCustomer } from "@lib/data/customer"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")

    if (!productId) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      )
    }

    const authHeaders = await getAuthHeaders()

    if (!authHeaders || Object.keys(authHeaders).length === 0) {
      // User is not logged in, so they haven't reviewed
      return NextResponse.json({ hasReviewed: false, reviews: [] })
    }

    // Get customer ID
    const customer = await retrieveCustomer()
    if (!customer || !customer.id) {
      return NextResponse.json({ hasReviewed: false, reviews: [] })
    }

    // Check if customer has reviewed this product
    const response = await sdk.client.fetch(`/store/reviews`, {
      method: "GET",
      query: {
        customer_id: customer.id,
        product_id: productId,
      },
      headers: authHeaders,
    })

    const reviews = Array.isArray(response) ? response : response?.reviews || []
    const hasReviewed = reviews.length > 0

    return NextResponse.json({ hasReviewed, reviews })
  } catch (error: any) {
    console.error("[GET /api/reviews/check] Error:", error)
    // If error, assume no review exists
    return NextResponse.json({ hasReviewed: false, reviews: [] })
  }
}

