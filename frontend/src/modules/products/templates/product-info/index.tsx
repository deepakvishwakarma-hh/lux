import { Heading } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Brand } from "@lib/data/brands"
import Image from "next/image"
import ProductReviewSummary from "@modules/products/components/product-review-summary"
import { ReviewsResponse } from "@lib/data/reviews"
import { ProductAvailabilityResponse } from "@lib/data/products"
import AvailabilityDetails from "@modules/products/components/availability-details"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  brand: Brand | null
  reviewSummary: ReviewsResponse | null
  availability: ProductAvailabilityResponse | null
  region: HttpTypes.StoreRegion
  countryCode: string
}

// Helper function to check if a variant is in stock
const isVariantInStock = (variant: HttpTypes.StoreProductVariant): boolean => {
  // If we don't manage inventory, we can always add to cart
  if (!variant.manage_inventory) {
    return true
  }

  // If we allow back orders on the variant, we can add to cart
  if (variant.allow_backorder) {
    return true
  }

  // If there is inventory available, we can add to cart
  if (variant.manage_inventory && (variant.inventory_quantity || 0) > 0) {
    return true
  }

  // Otherwise, it's out of stock
  return false
}

// Helper function to get ETA from product metadata based on stock status
const getETA = (
  product: HttpTypes.StoreProduct,
  inStock: boolean,
  hasBackorder: boolean
): string | null => {
  const metadata = product.metadata || {}

  if (inStock) {
    // Use regular delivery days if in stock
    const days = metadata.days_of_deliery || metadata.days_of_delivery
    const maxDays = metadata.max_days_of_delivery

    if (days && maxDays) {
      return `${days}-${maxDays} days`
    } else if (days) {
      return `${days} days`
    } else if (maxDays) {
      return `Up to ${maxDays} days`
    }
  } else if (hasBackorder) {
    // Use backorder delivery days
    const days = metadata.days_of_delivery_backorders
    if (days) {
      return `${days} days`
    }
  } else {
    // Use out of stock delivery days
    const days = metadata.days_of_delivery_out_of_stock
    const maxDays = metadata.max_days_of_delivery_out_of_stock

    if (days && maxDays) {
      return `${days}-${maxDays} days`
    } else if (days) {
      return `${days} days`
    } else if (maxDays) {
      return `Up to ${maxDays} days`
    }
  }

  return null
}

const ProductInfo = ({
  product,
  brand,
  reviewSummary,
  availability,
  region,
  countryCode,
}: ProductInfoProps) => {
  // Check stock availability from product data
  const isInStock = (() => {
    if (!product.variants || product.variants.length === 0) {
      return false
    }
    return product.variants.some((variant) => isVariantInStock(variant))
  })()

  // Check if any variant allows backorder
  const hasBackorder =
    product.variants?.some((variant) => variant.allow_backorder) ?? false

  // Check region availability first
  const regionAvailable = availability?.region_available ?? true

  // Get region display name
  const regionName = region?.countries?.find((c) => c.iso_2 === countryCode)?.display_name || 
                     region?.name || 
                     countryCode.toUpperCase()

  // Determine availability status
  const getAvailabilityStatus = () => {
    // First check: Is product available in this region?
    if (!regionAvailable) {
      return { 
        text: "Not Available in Your Region", 
        color: "text-red-700", 
        bg: "bg-red-50", 
        dot: "bg-red-500" 
      }
    }
    
    // Second check: Stock status (only if available in region)
    if (isInStock) {
      return { 
        text: "In Stock", 
        color: "text-green-700", 
        bg: "bg-green-50", 
        dot: "bg-green-500" 
      }
    }
    
    // Out of stock (but available in region)
    return { 
      text: "Out of Stock", 
      color: "text-red-700", 
      bg: "bg-red-50", 
      dot: "bg-red-500" 
    }
  }

  const availabilityStatus = getAvailabilityStatus()
  
  // Product is available if region is available AND (in stock OR has backorder)
  const isAvailable = regionAvailable && (isInStock || hasBackorder)

  // Use ETA from region metadata if available, otherwise calculate from product metadata based on stock status
  const eta = availability?.eta ?? getETA(product, isInStock, hasBackorder)

  // Derive item number from brandname + model + color_code + size
  const itemNo = (() => {
    const parts: string[] = []
    
    // Get brandname
    if (brand?.name) {
      parts.push(brand.name)
    }
    
    // Get model from metadata
    if (product.metadata?.model) {
      parts.push(String(product.metadata.model))
    }
    
    // Get color_code from metadata
    if (product.metadata?.color_code) {
      parts.push(String(product.metadata.color_code))
    }
    
    // Get size from metadata
    if (product.metadata?.size) {
      parts.push(String(product.metadata.size))
    }
    
    // Return joined parts or fallback
    return parts.length > 0 ? parts.join(" ") : "N/A"
  })()

  return (
    <div id="product-info" className="space-y-6">
      <header className="space-y-4">
        {brand && (
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <span className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
              Brand
            </span>
            <LocalizedClientLink
              href={`/brands/${brand.slug || brand.id}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              target="_blank"
              rel="noopener noreferrer"
              role="link"
              aria-label={`View brand ${brand.name} in a new tab`}
            >
              {brand.image_url ? (
                <Image 
                  src={brand.image_url} 
                  alt={brand.name} 
                  width={80} 
                  height={80}
                  className="object-contain max-h-12 w-auto"
                />
              ) : (
                <span className="text-sm sm:text-base font-semibold text-gray-900 font-urbanist">
                  {brand.name}
                </span>
              )}
            </LocalizedClientLink>
          </div>
        )}

        <div className="space-y-1">
          <Heading
            level="h1"
            className="text-lg sm:text-xl md:text-2xl font-bold leading-tight text-gray-900 break-words font-urbanist"
            data-testid="product-title"
          >
            {product.title}
          </Heading>

          {product.subtitle && (
            <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
              {product.subtitle}
            </p>
          )}

          {/* Review Summary - Inline with title/subtitle */}
          <div className="pt-2">
            <ProductReviewSummary reviewSummary={reviewSummary} />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
              Item No:
            </span>
            <span className="text-sm sm:text-base font-semibold text-gray-900 font-urbanist">
              {itemNo}
            </span>
          </div>
        </div>
      </header>

      <div className="space-y-4 pt-4 border-t border-gray-200">
        {/* Availability Status */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${availabilityStatus.bg} border-gray-200`}>
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${availabilityStatus.dot}`}
            aria-hidden="true"
          />
          <span className={`text-xs font-medium ${availabilityStatus.color}`}>
            {availabilityStatus.text}
          </span>
        </div>

        {/* Availability Details - Expected Delivery Date */}
        {isAvailable && eta && (
          <div className="pb-2">
            <AvailabilityDetails eta={eta} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
