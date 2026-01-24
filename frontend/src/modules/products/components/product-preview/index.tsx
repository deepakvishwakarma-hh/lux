import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import AddToCartButton from "./add-to-cart-button"
import HoverActions from "./hover-actions"
import { getBrandsByProductId } from "@lib/data/brands"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  // Fetch brand for item number calculation
  const brand = product.id ? await getBrandsByProductId(product.id) : null

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

  const brandName = product.title.split(" ")[0]

  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group"
      target="_blank"
    >
      <div
        data-testid="product-wrapper"
        className="shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150 overflow-hidden relative bg-white"
      >
        {cheapestPrice &&
          cheapestPrice.price_type === "sale" &&
          cheapestPrice.percentage_diff && (
            <div className="absolute top-2 left-2 z-10 bg-black text-white px-2 py-1 rounded-full text-[11px] font-semibold">
              -{cheapestPrice.percentage_diff}%
            </div>
          )}
        <HoverActions product={product} />
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex flex-col txt-compact-medium mt-4 justify-between px-4 pb-4">
          <p
            className="text-ui-fg-subtle text-center font-semibold"
            data-testid="product-title"
          >
            {itemNo}
          </p>
          <p className="text-ui-fg-subtle text-center text-sm my-1">
            {brandName}
          </p>
          <div className="flex items-center justify-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
          <AddToCartButton product={product} countryCode={countryCode} />
        </div>
      </div>
    </LocalizedClientLink>
  )
}
