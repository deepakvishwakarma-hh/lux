import { Suspense } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NavSearch from "@modules/layout/components/nav-search"
import NavHeader from "@modules/layout/components/nav-header"
import MobileMenu from "@modules/layout/components/mobile-menu"
import CartButton from "@modules/layout/components/cart-button"
import { websiteConfig } from "@lib/website.config"

export default function Nav() {
  return (
    <div className="sticky top-0 inset-x-0 z-50 bg-white border-b border-ui-border-base">
      {/* ================= HEADER ================= */}
      <header className="h-16 md:h-20">
        <nav className="relative px-4 md:px-10 flex items-center justify-between w-full h-full">
          {/* ================= LEFT ================= */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu (includes hamburger button) */}
            <MobileMenu />

            {/* Logo (DESKTOP ONLY → LEFT SIDE) */}
            <LocalizedClientLink
              href="/"
              className="hidden md:flex items-center"
            >
              <Image
                src={websiteConfig.logo.path}
                alt={websiteConfig.logo.alt}
                width={websiteConfig.logo.desktop.width}
                height={websiteConfig.logo.desktop.height}
                className="object-contain"
              />
            </LocalizedClientLink>
          </div>

          {/* ================= MOBILE CENTER LOGO ================= */}
          <LocalizedClientLink
            href="/"
            className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center"
          >
            <Image
              src={websiteConfig.logo.path}
              alt={websiteConfig.logo.alt}
              width={websiteConfig.logo.mobile.width}
              height={websiteConfig.logo.mobile.height}
              className="object-contain"
            />
          </LocalizedClientLink>

          {/* ================= CENTER & RIGHT (Client Components) ================= */}
          <NavHeader
            cartButton={
              <Suspense fallback={<span className="text-sm">Cart (0)</span>}>
                <CartButton />
              </Suspense>
            }
          />
        </nav>
      </header>

      {/* Mobile Search */}
      <div className="px-4 pb-3 md:hidden">
        <NavSearch />
      </div>


    </div>
  )
}
