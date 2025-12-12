"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import { getLikedProductIdsFromAPI } from "@lib/util/liked-api"

export default function LikedButton() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Get initial count
    const updateCount = async () => {
      try {
        // Always use API (works for both logged in and guest users)
        const likedIds = await getLikedProductIdsFromAPI()
        setCount(likedIds.length)
      } catch (error) {
        console.error("Error fetching liked count:", error)
        setCount(0)
      }
    }

    updateCount()

    // Listen for custom likedUpdated event
    const handleLikedUpdate = () => {
      getLikedProductIdsFromAPI()
        .then((ids) => setCount(ids.length))
        .catch(() => setCount(0))
    }

    window.addEventListener("likedUpdated", handleLikedUpdate)

    // Also poll periodically as fallback (in case event doesn't fire)
    const interval = setInterval(() => {
      getLikedProductIdsFromAPI()
        .then((ids) => {
          setCount((prevCount) => {
            if (ids.length !== prevCount) {
              return ids.length
            }
            return prevCount
          })
        })
        .catch(() => {
          // On error, keep current count
        })
    }, 2000) // Check every 2 seconds

    return () => {
      window.removeEventListener("likedUpdated", handleLikedUpdate)
      clearInterval(interval)
    }
  }, [])

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
