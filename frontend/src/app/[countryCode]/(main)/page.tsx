import { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import HeroCarouselTemplate from "@modules/layout/templates/hero-carousel"
import DiscountBar from "@modules/home/components/discount-bar"
import TopCatalog from "@modules/home/components/top-catalog"
import PaginatedProducts from "@modules/store/templates/paginated-products"
export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 15 and Medusa.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <HeroCarouselTemplate />
      <DiscountBar />
      <TopCatalog />
      <div className="content-container py-12 small:py-24">
        <PaginatedProducts
          sortBy="created_at"
          page={1}
          countryCode={countryCode}
        />
      </div>
      <TopCatalog />
    </>
  )
}
