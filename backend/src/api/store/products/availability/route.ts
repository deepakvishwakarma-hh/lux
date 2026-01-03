/**
 * Product Availability API
 * 
 * GET /store/products/availability
 * 
 * Check if a product is available in a specific region.
 * Stock availability should be checked from the product data already available in the frontend.
 * 
 * Query Parameters:
 * - handle: Product handle (required)
 * - region: Region code (e.g., "us", "in", "de", "fr", "it", "uk", "es") (required)
 * 
 * Response:
 * {
 *   "region_available": boolean,
 *   "eta": string | null,
 *   "product_id": string,
 *   "product_title": string,
 *   "handle": string,
 *   "region": string
 * }
 * 
 * Examples:
 * - Check availability: /store/products/availability?handle=product-handle&region=us
 */

import type {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    try {
        const { handle, region } = req.query

        // Validate required parameters
        if (!handle || typeof handle !== "string") {
            return res.status(400).json({
                error: "Missing or invalid 'handle' parameter. Product handle is required.",
            })
        }

        if (!region || typeof region !== "string") {
            return res.status(400).json({
                error: "Missing or invalid 'region' parameter. Region code is required.",
            })
        }

        const query = req.scope.resolve("query")

        // Query product by handle - only get metadata for region check
        const { data: products } = await query.graph({
            entity: "product",
            fields: [
                "id",
                "title",
                "handle",
                "status",
                "metadata",
            ],
            filters: {
                handle: handle,
            },
        })

        // Check if product exists
        if (!products || products.length === 0) {
            return res.status(404).json({
                region_available: false,
                error: "Product not found",
                handle: handle,
                region: region,
            })
        }

        const product = products[0]

        // Check if product is published
        if (product.status !== "published") {
            return res.json({
                region_available: false,
                product_id: product.id,
                product_title: product.title,
                handle: product.handle,
                region: region,
                message: "Product is not published",
            })
        }

        // Check region availability from metadata
        // region_availability is stored as comma-separated string like "us,en,in"
        const regionAvailability = product.metadata?.region_availability
        const normalizedRegion = region.toLowerCase().trim()
        let regionAvailable = false
        let eta: string | null = null

        if (regionAvailability) {
            // Convert to string and split by comma
            const regionStr = String(regionAvailability).trim()
            const regions = regionStr.split(",").map((r: string) => r.trim().toLowerCase()).filter(Boolean)

            // Check if requested region is in the list
            regionAvailable = regions.includes(normalizedRegion)

            // If region is available, fetch region data and get ETA from region's metadata
            if (regionAvailable) {
                try {
                    // Map region code to country codes for matching
                    // Query regions with countries and metadata using MedusaJS query.graph
                    const { data: regions } = await query.graph({
                        entity: "region",
                        fields: [
                            "id",
                            "name",
                            "currency_code",
                            "metadata",
                            "countries.iso_2",
                        ],
                    })
                    const region = regions.find((r: any) => r.name.toLowerCase() === normalizedRegion)
                    if (region) {
                        eta = String(region.metadata?.eta)
                    }
                } catch (error) {
                    console.error("Error fetching region data:", error)
                    // Continue without ETA if region fetch fails
                }
            }
        } else {
            // If region_availability is not set, assume product is available in all regions
            regionAvailable = false
        }

        return res.json({
            region_available: regionAvailable,
            eta: eta,
            product_id: product.id,
            product_title: product.title,
            handle: product.handle,
            region: region,
        })
    } catch (error: any) {
        console.error("Error checking product availability:", error)
        return res.status(500).json({
            error: "Internal server error",
            message: error?.message || "An error occurred while checking product availability",
        })
    }
}

