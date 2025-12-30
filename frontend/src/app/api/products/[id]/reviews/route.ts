import { NextRequest, NextResponse } from "next/server"
import { getProductReviews } from "@lib/data/reviews"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")

    const data = await getProductReviews(params.id, { limit, offset })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[GET /api/products/[id]/reviews] Error:", error)
    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch reviews",
      },
      { status: error?.status || 500 }
    )
  }
}

