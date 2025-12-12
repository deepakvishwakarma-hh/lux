"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import { getLikedCount } from "@lib/util/liked-cookies"
import { isLoggedIn, getLikedProductIdsFromAPI } from "@lib/util/liked-api"

export default function LikedButton() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Get initial count
    const updateCount = async () => {
      if (isLoggedIn()) {
        // User is logged in, get from API
        try {
          const likedIds = await getLikedProductIdsFromAPI()
          setCount(likedIds.length)
        } catch (error) {
          console.error("Error fetching liked count:", error)
          // Fallback to cookies
          setCount(getLikedCount())
        }
      } else {
        // User is not logged in, get from cookies
        setCount(getLikedCount())
      }
    }

    updateCount()

    // Listen for custom likedUpdated event
    const handleLikedUpdate = () => {
      if (isLoggedIn()) {
        // For logged in users, fetch from API
        getLikedProductIdsFromAPI()
          .then((ids) => setCount(ids.length))
          .catch(() => setCount(getLikedCount()))
      } else {
        setCount(getLikedCount())
      }
    }

    window.addEventListener("likedUpdated", handleLikedUpdate)

    // Also poll periodically as fallback (in case event doesn't fire)
    const interval = setInterval(() => {
      if (isLoggedIn()) {
        // For logged in users, fetch from API periodically
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
            const newCount = getLikedCount()
            setCount((prevCount) => {
              if (newCount !== prevCount) {
                return newCount
              }
              return prevCount
            })
          })
      } else {
        const newCount = getLikedCount()
        setCount((prevCount) => {
          if (newCount !== prevCount) {
            return newCount
          }
          return prevCount
        })
      }
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
