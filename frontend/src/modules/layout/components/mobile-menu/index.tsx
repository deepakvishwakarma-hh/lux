"use client"

import { useState } from "react"
import { HiOutlineMenu, HiX } from "react-icons/hi"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AccountDropdown from "@modules/layout/components/account-dropdown"
import { useCustomer } from "@lib/hooks/use-customer"
import NavSearch from "@modules/layout/components/nav-search"
import CompareButton from "@modules/layout/components/compare-button"
import LikedButton from "@modules/layout/components/liked-button"

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { customer, isLoading } = useCustomer()

  return (
    <>
      {/* Hamburger button */}
      <button
        className="md:hidden"
        onClick={() => setMenuOpen(true)}
        aria-label="Open Menu"
      >
        <HiOutlineMenu size={24} />
      </button>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute left-0 top-0 h-full w-[80%] max-w-sm bg-white p-5 shadow-lg">
            {/* Close */}
            <button className="mb-6" onClick={() => setMenuOpen(false)}>
              <HiX size={24} />
            </button>

            {/* LOGIN / REGISTER INSIDE MENU */}
            <div className="mb-4">
              <AccountDropdown customer={customer} isLoading={isLoading} />
            </div>



            {/* Quick actions (Compare / Liked) */}
            <div className="flex flex-col gap-3 mb-4">
              <CompareButton labelOnly />
              <LikedButton labelOnly label="Wishlist" />
            </div>

            {/* NAV LINKS */}
            <div className="flex flex-col gap-4 text-sm">
              <LocalizedClientLink href="/" onClick={() => setMenuOpen(false)}>
                Home
              </LocalizedClientLink>

              <LocalizedClientLink
                href="/store"
                onClick={() => setMenuOpen(false)}
              >
                Shop
              </LocalizedClientLink>

              <LocalizedClientLink
                href="/collections"
                onClick={() => setMenuOpen(false)}
              >
                Collections
              </LocalizedClientLink>

              <LocalizedClientLink
                href="/about"
                onClick={() => setMenuOpen(false)}
              >
                About Us
              </LocalizedClientLink>

              <LocalizedClientLink
                href="/contact"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

