"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import PreviewPrice from "@modules/products/components/product-preview/price"
import AddToCartButton from "@modules/products/components/product-preview/add-to-cart-button"
import HoverActions from "@modules/products/components/product-preview/hover-actions"

type ProductPreviewProps = {
  product: any
  region: HttpTypes.StoreRegion
  countryCode: string
  viewMode?: "list" | "grid-2" | "grid-3" | "grid-4"
}

export default function ProductPreview({
  product,
  region,
  countryCode,
  viewMode = "grid-3",
}: ProductPreviewProps) {
  // Convert filter API product format to match expected format
  const formattedProduct: HttpTypes.StoreProduct = {
    ...product,
    variants: product.variants?.map((v: any) => ({
      ...v,
      calculated_price: v.price
        ? {
            calculated_amount: v.price,
            currency_code: product.currency_code || "USD",
            original_amount: v.price,
            calculated_price: {
              price_list_type: "sale",
            },
          }
        : undefined,
    })),
  }

  // Get price for display
  let cheapestPrice: any = null
  if (product.price !== null && product.price !== undefined) {
    const priceAmount = product.price / 100 // Convert from cents
    cheapestPrice = {
      calculated_price_number: priceAmount,
      calculated_price: product.price_formatted || `$${priceAmount.toFixed(2)}`,
      original_price_number: priceAmount,
      original_price: product.price_formatted || `$${priceAmount.toFixed(2)}`,
      currency_code: product.currency_code || "USD",
      price_type: "default",
      percentage_diff: null,
    }
  }

  // Determine list view and stock state so we can render a compact badge on list
  const isList = viewMode === "list"

  // Basic stock detection (matches logic used in AddToCartButton)
  const firstVariant = product.variants?.[0]
  const inStock = (() => {
    if (!firstVariant) return false
    if (!firstVariant.manage_inventory) return true
    if (firstVariant.allow_backorder) return true
    if ((firstVariant.inventory_quantity || 0) > 0) return true
    return false
  })()

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className={`group ${isList ? 'w-full' : 'h-full'}`}>
      <div
        data-testid="product-wrapper"
        className={`shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150 ${isList ? 'relative flex flex-row gap-4 items-start p-4 sm:p-5 border border-gray-100 rounded-lg bg-white' : 'overflow-hidden relative h-full flex flex-col'}`}
      >
        {cheapestPrice &&
          cheapestPrice.price_type === "sale" &&
          cheapestPrice.percentage_diff && (
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-10 bg-black text-white px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold">
              -{cheapestPrice.percentage_diff}%
            </div>
          )}
        <HoverActions product={formattedProduct} />


        <div className={isList ? 'w-40 sm:w-48 flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center' : ''}>
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size={isList ? 'medium' : 'full'}
            className={isList ? 'p-0 bg-transparent shadow-none' : ''}
            // use object-contain in list view so full image is visible and not cropped
            imageClassName={isList ? 'object-contain' : ''}
          />
        </div>
        <div className={`flex flex-col txt-compact-medium ${isList ? 'flex-1 justify-start px-4 py-0 sm:py-0' : 'mt-2 sm:mt-4 justify-between px-3 sm:px-4 pb-3 sm:pb-4 flex-grow'}`}>
          <div className="py-3 sm:py-2">
            <p
              className={`${isList ? 'text-left text-base sm:text-base font-semibold text-gray-900 truncate' : 'text-ui-fg-subtle text-center text-xs sm:text-sm'}`}
              data-testid="product-title"
            >
              {product.title}
            </p>
            {product.brand && (
              <p className={`${isList ? 'text-left text-sm text-gray-500 mt-1' : 'text-ui-fg-subtle text-center font-bold text-xs sm:text-sm'}`}>
                {product.brand.name}
              </p>
            )}
            {isList && product.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
            )}
          </div>

          {isList ? (
            <div className="flex items-center gap-4 w-full mt-2">
              <div>
                {cheapestPrice ? (
                  <div className="text-2xl font-bold text-gray-900">{cheapestPrice.calculated_price}</div>
                ) : (
                  <span className="text-sm text-gray-500">&nbsp;</span>
                )}
                {product.location && (
                  <div className="text-sm text-gray-500">{product.location}</div>
                )}
              </div>

              <div className="ml-auto flex items-center gap-2">
                {inStock ? (
                  <AddToCartButton
                    product={formattedProduct}
                    countryCode={countryCode}
                  />
                ) : (
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-md">Out of stock</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-x-2">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
              <div>
                <AddToCartButton
                  product={formattedProduct}
                  countryCode={countryCode}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}

