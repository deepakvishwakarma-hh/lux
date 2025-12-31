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

  const isList = viewMode === "list"

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className={`group ${isList ? 'w-full' : 'h-full'}`}>
      <div
        data-testid="product-wrapper"
        className={`shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150 ${isList ? 'relative flex flex-row gap-4 items-start' : 'overflow-hidden relative h-full flex flex-col'}`}
      >
        {cheapestPrice &&
          cheapestPrice.price_type === "sale" &&
          cheapestPrice.percentage_diff && (
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-10 bg-black text-white px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold">
              -{cheapestPrice.percentage_diff}%
            </div>
          )}
        <HoverActions product={formattedProduct} />
        <div className={isList ? 'w-36 sm:w-44 flex-shrink-0' : ''}>
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size={isList ? 'medium' : 'full'}
          />
        </div>
        <div className={`flex flex-col txt-compact-medium ${isList ? 'justify-start px-4 py-3 flex-1' : 'mt-2 sm:mt-4 justify-between px-3 sm:px-4 pb-3 sm:pb-4 flex-grow'}`}>
          <p
            className={`${isList ? 'text-ui-fg-subtle text-left text-sm font-semibold' : 'text-ui-fg-subtle text-center text-xs sm:text-sm'}`}
            data-testid="product-title"
          >
            {product.title}
          </p>
          {product.brand && (
            <p className={`${isList ? 'text-ui-fg-subtle text-left font-bold text-sm' : 'text-ui-fg-subtle text-center font-bold text-xs sm:text-sm'}`}>
              {product.brand.name}
            </p>
          )}
          {isList ? (
            <div className="mt-2 flex items-center gap-4">
              {cheapestPrice ? (
                <span className="text-lg font-bold text-gray-900">{cheapestPrice.calculated_price}</span>
              ) : (
                <span className="text-sm text-gray-500">&nbsp;</span>
              )}
              <div className="ml-auto">
                <AddToCartButton
                  product={formattedProduct}
                  countryCode={countryCode}
                />
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

