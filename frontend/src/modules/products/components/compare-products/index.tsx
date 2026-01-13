"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"
import { removeFromCompare } from "@lib/util/compare-cookies"
import { useRouter } from "next/navigation"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import AddToCartButton from "@modules/products/components/product-preview/add-to-cart-button"

type CompareProductsProps = {
  products: HttpTypes.StoreProduct[]
  countryCode: string
}

export default function CompareProducts({ products, countryCode }: CompareProductsProps) {
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
        const imageSrc = product.thumbnail || product.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.url || null
        return (
          <div key={product.id} className="border border-gray-200 rounded p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-600">&nbsp;</div>
              <button
                onClick={() => handleRemove(product.id)}
                className="text-sm text-gray-600 hover:underline"
                aria-label="Remove from compare"
              >
                × Remove
              </button>
            </div>

            <LocalizedClientLink href={`/products/${product.handle}`} target="_blank" className="flex flex-col items-center gap-3 w-full text-center">
              {imageSrc ? (
                <div className="relative w-40 h-40">
                  <Image src={imageSrc} alt={product.title || "Product image"} fill className="object-contain" />
                </div>
              ) : (
                <div className="w-40 h-40 bg-gray-100 flex items-center justify-center">
                  <span className="text-ui-fg-subtle">No image</span>
                </div>
              )}

              <div className="font-medium text-ui-fg-base">{product.title}</div>

              <div>
                {cheapestPrice ? (
                  <div className="flex flex-col items-center">
                    <span className={cheapestPrice.price_type === "sale" ? "text-ui-fg-interactive font-semibold text-lg" : "text-ui-fg-base font-semibold text-lg"}>
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

              <AddToCartButton product={product} countryCode={countryCode} />
            </LocalizedClientLink>
          </div>
        )
      })}
    </div>
  )

  // Desktop table view (md+)
  const desktopTable = (
    <div className="hidden md:block overflow-x-auto">
      <div className="max-w-[1100px] mx-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-white">
              <th className="border border-gray-200 p-4 w-[220px]">&nbsp;</th>
              {products.map((product) => (
                <th key={product.id} className="border border-gray-200 p-4 min-w-[220px] relative align-top text-center">
                  <div className="flex justify-between items-start">
                    <div className="text-sm text-gray-600">&nbsp;</div>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="text-sm text-gray-600 hover:underline"
                      aria-label="Remove from compare"
                    >
                      × Remove
                    </button>
                  </div>

                  <LocalizedClientLink href={`/products/${product.handle}`} className="block hover:opacity-80 transition-opacity" target="_blank">
                    {(() => {
                      const imageSrc = product.thumbnail || product.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.url || null
                      return imageSrc ? (
                        <div className="relative w-full h-48 mb-3 flex items-center justify-center">
                          <Image src={imageSrc} alt={product.title || "Product image"} fill className="object-contain" sizes="(max-width: 768px) 100vw, 250px" />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center mb-3">
                          <span className="text-ui-fg-subtle">No image</span>
                        </div>
                      )
                    })()}

                    <div className="font-medium text-ui-fg-base mb-2">{product.title}</div>

                    <div>
                      {(() => {
                        const priced = getPricedProduct(product)
                        const { cheapestPrice } = getProductPrice({ product: priced })
                        if (cheapestPrice) {
                          return (
                            <div className="flex flex-col items-center">
                              <span className={cheapestPrice.price_type === "sale" ? "text-ui-fg-interactive font-semibold text-lg" : "text-ui-fg-base font-semibold text-lg"}>
                                {cheapestPrice.calculated_price}
                              </span>
                              {cheapestPrice.price_type === "sale" && (
                                <span className="text-ui-fg-subtle line-through text-sm">{cheapestPrice.original_price}</span>
                              )}
                            </div>
                          )
                        }
                        const fallbackPrice = (product as any).price != null ? ((product as any).price_formatted || `$${((product as any).price / 100).toFixed(2)}`) : null
                        return fallbackPrice ? <div className="text-ui-fg-base font-semibold text-lg">{fallbackPrice}</div> : <span className="text-ui-fg-subtle">N/A</span>
                      })()}
                    </div>

                    <AddToCartButton product={product} countryCode={countryCode} />
                  </LocalizedClientLink>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Availability Row */
            }
            <tr>
              <td className="border border-gray-200 p-4 font-semibold bg-gray-50">AVAILABILITY</td>
              {products.map((product) => {
                const firstVariant = product.variants?.[0]
                const inStock = (() => {
                  if (!firstVariant) return false
                  if (!firstVariant.manage_inventory) return true
                  if (firstVariant.allow_backorder) return true
                  if ((firstVariant.inventory_quantity || 0) > 0) return true
                  return false
                })()
                return (
                  <td key={product.id} className="border border-gray-200 p-4">
                    {inStock ? (
                      <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-3 py-1 text-sm rounded">✓ In stock</div>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-3 py-1 text-sm rounded">Out of stock</div>
                    )}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <>
      {mobileView}
      {desktopTable}
    </>
  )
}
