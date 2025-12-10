import { Suspense } from "react"
import Image from "next/image"

import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import NavSearch from "@modules/layout/components/nav-search"
import AccountDropdown from "@modules/layout/components/account-dropdown"
import CompareButton from "@modules/layout/components/compare-button"
import LikedButton from "@modules/layout/components/liked-button"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const customer = await retrieveCustomer()

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-20  border-b duration-200 bg-white border-ui-border-base">
        <nav className="px-10 txt-xsmall-plus text-ui-fg-subtle flex items-center gap-10 w-full h-full text-small-regular ">
          {/* Left: Logo */}
          <LocalizedClientLink
            href="/"
            className="flex flex-col items-start justify-center h-full hover:opacity-80 transition-opacity"
            data-testid="nav-store-link"
          >
            <Image
              src="/logo.avif"
              alt="Luxurious Mart"
              width={205}
              height={66}
              className="object-contain"
            />
          </LocalizedClientLink>

          {/* Center: Search */}
          <div className="flex-1 flex justify-center">
            <NavSearch />
          </div>

          {/* Right: Account, Compare, Liked, Cart */}
          <div className="flex items-center gap-x-6 h-full">
            <AccountDropdown customer={customer} />

            <CompareButton />

            <LikedButton />

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2 items-center relative"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <span className="text-small-regular">Cart (0)</span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
