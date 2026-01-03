import { Heading } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Brand } from "@lib/data/brands"
import Image from "next/image"
import ProductReviewSummary from "@modules/products/components/product-review-summary"
import { ReviewsResponse } from "@lib/data/reviews"
import { ProductAvailabilityResponse } from "@lib/data/products"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  brand: Brand | null
  reviewSummary: ReviewsResponse | null
  availability: ProductAvailabilityResponse | null
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
const getETA = (product: HttpTypes.StoreProduct, inStock: boolean, hasBackorder: boolean): string | null => {
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

const ProductInfo = ({ product, brand, reviewSummary, availability }: ProductInfoProps) => {
  // Check stock availability from product data
  const isInStock = (() => {
    if (!product.variants || product.variants.length === 0) {
      return false
    }
    return product.variants.some((variant) => isVariantInStock(variant))
  })()

  // Check if any variant allows backorder
  const hasBackorder = product.variants?.some((variant) => variant.allow_backorder) ?? false

  // Product is available if region is available AND (in stock OR has backorder)
  const regionAvailable = availability?.region_available ?? true
  const isAvailable = regionAvailable && (isInStock || hasBackorder)
  
  // Use ETA from region metadata if available, otherwise calculate from product metadata based on stock status
  const eta = availability?.eta ?? getETA(product, isInStock, hasBackorder)

  return (
    <div id="product-info">
      {/* Brand Details JSON Display */}
      {brand && brand.image_url && (
        <LocalizedClientLink
          href={`/brands/${brand.slug}`}
          className="flex items-center justify-start gap-2"
        >
          <p className="text-sm font-bold ">Brand :</p>
          <Image
            src={brand.image_url ?? ""}
            alt={brand.name}
            width={30}
            height={30}
          />
        </LocalizedClientLink>
      )}

      <div className="flex flex-col gap-y-3">
        <Heading
          level="h2"
          className="text-lg sm:text-2xl md:text-3xl font-bold leading-tight sm:leading-9 md:leading-10 text-ui-fg-base pr-2 sm:pr-5 font-urbanist break-words"
          data-testid="product-title"
        >
          {product.title}
        </Heading>
        {/* Review Summary */}
        <ProductReviewSummary reviewSummary={reviewSummary} />
        {/* Availability Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isAvailable ? "bg-green-500" : "bg-red-500"
            }`}
            aria-hidden="true"
          />
          <p
            className={`text-sm font-medium ${
              isAvailable ? "text-green-700" : "text-red-700"
            }`}
            data-testid="product-availability-status"
          >
            {isAvailable ? (
              <>
                Available{eta && ` - ETA: ${eta}`}
              </>
            ) : (
              "This item is not available"
            )}
          </p>
        </div>

        <p className="text-sm font-medium">
          Item No : {(product?.metadata?.item_no as string) ?? "N/A"}
        </p>
      </div>
    </div>
  )
}

export default ProductInfo
