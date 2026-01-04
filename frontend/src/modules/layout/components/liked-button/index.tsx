"use client"

import { useMemo } from "react"
import useSWR from "swr"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import {
  getLikedProductIdsFromAPI,
  LIKED_PRODUCTS_SWR_KEY,
} from "@lib/util/liked-api"

// SWR fetcher function
const likedProductsFetcher = async (): Promise<string[]> => {
  try {
    return await getLikedProductIdsFromAPI()
  } catch (error) {
    console.error("Error fetching liked products:", error)
    return []
  }
}

export default function LikedButton() {
  // Use SWR to fetch and cache liked products
  const { data: likedIds } = useSWR<string[]>(
    LIKED_PRODUCTS_SWR_KEY,
    likedProductsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      shouldRetryOnError: false,
      fallbackData: [],
    }
  )

  const count = useMemo(() => likedIds?.length || 0, [likedIds])

  return (
    <LocalizedClientLink
      href="/liked"
      className="hover:text-ui-fg-base flex items-center relative"
      data-testid="nav-liked-link"
    >
      <WoodMartIcon iconContent="f106" size={20} badge={count} />
    </LocalizedClientLink>
  )
}
