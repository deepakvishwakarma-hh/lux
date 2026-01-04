"use client"

import { useCustomer } from "@lib/hooks/use-customer"
import AccountDropdown from "@modules/layout/components/account-dropdown"
import CompareButton from "@modules/layout/components/compare-button"
import LikedButton from "@modules/layout/components/liked-button"
import NavSearch from "@modules/layout/components/nav-search"

type NavHeaderProps = {
  cartButton: React.ReactNode
}

export default function NavHeader({ cartButton }: NavHeaderProps) {
  const { customer, isLoading } = useCustomer()

  return (
    <>
      {/* ================= CENTER (Desktop Search) ================= */}
      <div className="hidden md:flex flex-1 justify-center px-10">
        <NavSearch />
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex items-center gap-x-3 md:gap-x-6">
        {/* Account ONLY on desktop */}
        <div className="hidden md:block">
          <AccountDropdown customer={customer} isLoading={isLoading} />
        </div>

        <div className="hidden sm:block">
          <CompareButton />
        </div>

        <LikedButton />

        {cartButton}
      </div>
    </>
  )
}
