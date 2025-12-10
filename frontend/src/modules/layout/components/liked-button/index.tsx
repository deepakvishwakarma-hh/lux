import { Suspense } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import { getLikedProductsCount } from "@lib/data/liked-products"

async function LikedCount() {
  const count = await getLikedProductsCount()
  return count
}

export default function LikedButton() {
  return (
    <LocalizedClientLink
      href="/liked-products"
      className="hover:text-ui-fg-base flex items-center relative"
      data-testid="nav-liked-link"
    >
      <Suspense fallback={<WoodMartIcon iconContent="f106" size={20} />}>
        <LikedIconWithBadge />
      </Suspense>
    </LocalizedClientLink>
  )
}

async function LikedIconWithBadge() {
  return <WoodMartIcon iconContent="f106" size={20} />
}
