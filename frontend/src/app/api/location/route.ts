import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        // Fetch location data from ipinfo.io
        const response = await fetch("https://ipinfo.io/json", {
            headers: {
                Accept: "application/json",
            },
            next: {
                revalidate: 3600, // Cache for 1 hour
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch location: ${response.statusText}`)
        }

        const locationData = await response.json()

        return NextResponse.json(locationData, {
            status: 200,
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        })
    } catch (error) {
        console.error("Error fetching location:", error)
        return NextResponse.json(
            {
                error: "Failed to fetch location data",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
