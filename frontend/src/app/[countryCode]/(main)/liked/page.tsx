import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { getAllLikedProductIds } from "@lib/data/liked"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { Heading } from "@medusajs/ui"
import InteractiveLink from "@modules/common/components/interactive-link"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function LikedPage(props: Props) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  // Get product IDs from API (if logged in) or cookies (if not logged in)
  const productIds = await getAllLikedProductIds()

  // If no products liked, show empty state
  if (!productIds || productIds.length === 0) {
    return (
      <div className="content-container py-16">
        <div className="py-48 px-2 flex flex-col justify-center items-center min-h-[500px]">
          <div className="flex flex-col items-center gap-y-6 max-w-[500px] text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-2">
              <WoodMartIcon
                iconContent="f106"
                size={48}
                className="text-gray-400"
              />
            </div>
            <Heading level="h1" className="text-3xl-regular font-bold">
              Liked Products
            </Heading>
            <p className="text-base-regular text-ui-fg-subtle mt-2">
              You haven&apos;t liked any products yet. Start building your
              wishlist by clicking the heart icon on any product you love.
            </p>
            <div className="mt-6">
              <InteractiveLink href="/store">Explore products</InteractiveLink>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container py-16">
      <h1 className="text-3xl font-bold mb-8">Liked Products</h1>
      <PaginatedProducts
        sortBy="created_at"
        page={1}
        productsIds={productIds}
        countryCode={countryCode}
      />
    </div>
  )
}
