"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"
import { removeFromCompare } from "@lib/util/compare-cookies"
import { useRouter } from "next/navigation"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"

type CompareProductsProps = {
  products: HttpTypes.StoreProduct[]
}

export default function CompareProducts({ products }: CompareProductsProps) {
  const router = useRouter()

  const handleRemove = (productId: string) => {
    removeFromCompare(productId)
    router.refresh()
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-ui-fg-subtle text-lg">No products to compare.</p>
      </div>
    )
  }

  // Build a priced product fallback so we have price info even when calculated_price is missing.
  const getPricedProduct = (product: any) => {
    const variants = product.variants?.map((v: any) => {
      if (v.calculated_price) return v
      // If the variant has a raw price, synthesize a calculated_price object expected by our helpers.
      if (v.price != null) {
        return {
          ...v,
          calculated_price: {
            calculated_amount: v.price,
            currency_code: product.currency_code || "USD",
            original_amount: v.price,
            calculated_price: { price_list_type: "sale" },
          },
        }
      }
      return v
    })

    return {
      ...product,
      variants,
    }
  }

  // Mobile view (stacked cards)
  const mobileView = (
    <div className="md:hidden grid grid-cols-1 gap-4">
      {products.map((product) => {
        const priced = getPricedProduct(product)
        const { cheapestPrice } = getProductPrice({ product: priced })
        return (
          <div key={product.id} className="border border-gray-200 rounded p-4 flex items-center gap-4">
            <button
              onClick={() => handleRemove(product.id)}
              className="p-1 hover:bg-gray-200 rounded"
              aria-label="Remove from compare"
            >
              <WoodMartIcon iconContent="f112" size={16} />
            </button>
            <LocalizedClientLink href={`/products/${product.handle}`} target="_blank" className="flex items-center gap-4 w-full">
              {product.thumbnail ? (
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image src={product.thumbnail} alt={product.title || "Product image"} fill className="object-contain" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                  <span className="text-ui-fg-subtle">No image</span>
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium text-ui-fg-base">{product.title}</div>
                <div className="mt-2">
                  {cheapestPrice ? (
                    <div className="flex items-baseline gap-2">
                      <span className={cheapestPrice.price_type === "sale" ? "text-ui-fg-interactive font-semibold" : "text-ui-fg-base font-semibold"}>
                        {cheapestPrice.calculated_price}
                      </span>
                      {cheapestPrice.price_type === "sale" && (
                        <span className="text-ui-fg-subtle line-through text-sm">{cheapestPrice.original_price}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-ui-fg-subtle">N/A</span>
                  )}
                </div>
              </div>
            </LocalizedClientLink>
          </div>
        )
      })}
    </div>
  )

  // Desktop table view (md+)
  const desktopTable = (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 p-4 text-left font-semibold">Product</th>
            {products.map((product) => (
              <th key={product.id} className="border border-gray-200 p-4 min-w-[250px] relative align-top">
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded z-10"
                  aria-label="Remove from compare"
                >
                  <WoodMartIcon iconContent="f112" size={16} />
                </button>
                <LocalizedClientLink href={`/products/${product.handle}`} className="block hover:opacity-80 transition-opacity" target="_blank">
                  {product.thumbnail ? (
                    <div className="relative w-full h-48 mb-4">
                      <Image src={product.thumbnail} alt={product.title || "Product image"} fill className="object-contain" sizes="(max-width: 768px) 100vw, 250px" />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center mb-4">
                      <span className="text-ui-fg-subtle">No image</span>
                    </div>
                  )}
                </LocalizedClientLink>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Title Row */}
          <tr>
            <td className="border border-gray-200 p-4 font-semibold bg-gray-50">Title</td>
            {products.map((product) => (
              <td key={product.id} className="border border-gray-200 p-4">
                <LocalizedClientLink href={`/products/${product.handle}`} className="text-ui-fg-base hover:text-ui-fg-interactive font-medium" target="_blank">
                  {product.title}
                </LocalizedClientLink>
              </td>
            ))}
          </tr>

          {/* Price Row */}
          <tr>
            <td className="border border-gray-200 p-4 font-semibold bg-gray-50">Price</td>
            {products.map((product) => {
              const priced = getPricedProduct(product)
              const { cheapestPrice } = getProductPrice({ product: priced })
              // if we still don't have a price, fall back to product.price if available
              const fallbackPrice = !cheapestPrice && (product as any).price != null ? ((product as any).price_formatted || `$${((product as any).price / 100).toFixed(2)}`) : null

              return (
                <td key={product.id} className="border border-gray-200 p-4">
                  {cheapestPrice ? (
                    <div className="flex flex-col">
                      <span className={cheapestPrice.price_type === "sale" ? "text-ui-fg-interactive font-semibold text-lg" : "text-ui-fg-base font-semibold text-lg"}>
                        {cheapestPrice.calculated_price}
                      </span>
                      {cheapestPrice.price_type === "sale" && (
                        <>
                          <span className="text-ui-fg-subtle line-through text-sm">{cheapestPrice.original_price}</span>
                          <span className="text-ui-fg-interactive text-sm">Save {cheapestPrice.percentage_diff}%</span>
                        </>
                      )}
                    </div>
                  ) : fallbackPrice ? (
                    <div className="text-ui-fg-base font-semibold text-lg">{fallbackPrice}</div>
                  ) : (
                    <span className="text-ui-fg-subtle">N/A</span>
                  )}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      {mobileView}
      {desktopTable}
    </>
  )
}
