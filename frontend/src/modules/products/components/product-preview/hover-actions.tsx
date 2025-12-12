"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useEffect } from "react"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import { useRouter } from "next/navigation"
import {
  isInCompare,
  addToCompare,
  removeFromCompare,
} from "@lib/util/compare-cookies"
import {
  addToLikedAPI,
  removeFromLikedAPI,
  getLikedProductIdsFromAPI,
} from "@lib/util/liked-api"

type HoverActionsProps = {
  product: HttpTypes.StoreProduct
}

export default function HoverActions({ product }: HoverActionsProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [isInCompareState, setIsInCompareState] = useState(false)
  const [isCheckingLiked, setIsCheckingLiked] = useState(true)

  useEffect(() => {
    // Check compare products from cookies
    setIsInCompareState(isInCompare(product.id))

    // Check liked products
    const checkLikedStatus = async () => {
      setIsCheckingLiked(true)
      try {
        // Always use API (works for both logged in and guest users)
        const likedIds = await getLikedProductIdsFromAPI()
        setIsLiked(likedIds.includes(product.id))
      } catch (error) {
        console.error("Error checking liked status:", error)
        setIsLiked(false)
      } finally {
        setIsCheckingLiked(false)
      }
    }

    // Check liked status on mount
    checkLikedStatus()

    // Listen for liked updates from other components
    const handleLikedUpdate = () => {
      checkLikedStatus()
    }

    window.addEventListener("likedUpdated", handleLikedUpdate)

    return () => {
      window.removeEventListener("likedUpdated", handleLikedUpdate)
    }
  }, [product.id])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Optimistically update UI
    const previousLikedState = isLiked
    setIsLiked(!previousLikedState)

    try {
      // Always use API (works for both logged in and guest users)
      let success = false
      if (previousLikedState) {
        success = await removeFromLikedAPI(product.id)
      } else {
        success = await addToLikedAPI(product.id)
      }

      if (!success) {
        // Revert on failure
        setIsLiked(previousLikedState)
      } else {
        // Re-check status to ensure sync with server
        const likedIds = await getLikedProductIdsFromAPI()
        setIsLiked(likedIds.includes(product.id))
      }
    } catch (error) {
      console.error("Failed to like/unlike product:", error)
      // Revert on error
      setIsLiked(previousLikedState)
    }
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInCompareState) {
      // Remove from compare
      removeFromCompare(product.id)
      setIsInCompareState(false)
    } else {
      // Add to compare
      addToCompare(product.id)
      setIsInCompareState(true)
    }
  }

  const handleSearch = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Navigate to product page
    router.push(`/products/${product.handle}`)
  }

  return (
    <div className="absolute top-2 right-2 z-10 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-md p-1 shadow-md">
      <button
        onClick={handleCompare}
        className={isInCompareState ? "bg-black text-white rounded-full p-2" : "bg-white rounded-full p-2"}
        aria-label="Compare product"
        data-testid="compare-button"
      >
        <WoodMartIcon iconContent="f128" size={16} />
      </button>
      <button
        onClick={handleSearch}
        className="bg-white rounded-full p-2"
        aria-label="View product"
        data-testid="search-button"
      >
        <WoodMartIcon iconContent="f130" size={16} />
      </button>
      <button
        onClick={handleLike}
        className={isLiked ? "bg-black text-white rounded-full p-2" : "bg-white rounded-full p-2"}
        aria-label="Like product"
        data-testid="like-button"
        disabled={isCheckingLiked}
      >
        <WoodMartIcon iconContent="f106" size={16} />
      </button>
    </div>
  )
}
