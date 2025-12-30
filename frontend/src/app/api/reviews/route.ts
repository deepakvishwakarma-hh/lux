import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"

export async function POST(request: NextRequest) {
  try {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders || Object.keys(authHeaders).length === 0) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()

    const response = await sdk.client.fetch(`/store/reviews`, {
      method: "POST",
      body,
      headers: authHeaders,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[POST /api/reviews] Error:", error)
    return NextResponse.json(
      {
        error: error?.message || "Failed to create review",
      },
      { status: error?.status || 500 }
    )
  }
}

