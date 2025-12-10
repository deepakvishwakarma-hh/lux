"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"

export default function CompareButton() {
  const [count, setCount] = useState(0)

  // TODO: Fetch compare products count from API
  useEffect(() => {
    // Placeholder: This should fetch from your compare products API
    // For now, you can use localStorage or a context to get the count
    const compareItems = JSON.parse(
      localStorage.getItem("compareProducts") || "[]"
    )
    setCount(compareItems.length)
  }, [])

  return (
    <LocalizedClientLink
      href="/compare"
      className="hover:text-ui-fg-base flex items-center relative"
      data-testid="nav-compare-link"
    >
      <WoodMartIcon iconContent="f128" size={20} badge={count} />
    </LocalizedClientLink>
  )
}
