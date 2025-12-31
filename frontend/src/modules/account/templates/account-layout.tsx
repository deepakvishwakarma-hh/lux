import React from "react"
import UnderlineLink from "@modules/common/components/interactive-link"
import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 py-12" data-testid="account-page">
      <div className="content-container max-w-5xl mx-auto bg-white">
        {/* ===== WHEN USER IS LOGGED IN ===== */}
        {customer ? (
          <div className="grid grid-cols-1 small:grid-cols-[240px_1fr] gap-8">
            <AccountNav customer={customer} />

            <div className="flex justify-center">
              <div className="w-full max-w-3xl px-4">
                {children}
              </div>
            </div>
          </div>
        ) : (
          /* ===== LOGIN / REGISTER (CENTERED) ===== */
          <div className="flex justify-center">
            <div className="w-full max-w-md px-4">
              {children}
            </div>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <div className="flex flex-col small:flex-row items-end justify-between border-t border-gray-200 py-12 mt-12 gap-8">
          <div>
            <h3 className="text-xl-semi mb-4">Got questions?</h3>
            <span className="txt-medium">
              You can find frequently asked questions and answers on our
              customer service page.
            </span>
          </div>
          <UnderlineLink href="/customer-service">
            Customer Service
          </UnderlineLink>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
