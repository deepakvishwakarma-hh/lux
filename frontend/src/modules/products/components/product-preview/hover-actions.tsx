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
  isLiked as isLikedCookie,
  addToLiked as addToLikedCookie,
  removeFromLiked as removeFromLikedCookie,
} from "@lib/util/liked-cookies"
import {
  isLoggedIn,
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

  // Check if product is liked or in compare on mount
  useEffect(() => {
    // Check compare products from cookies
    setIsInCompareState(isInCompare(product.id))

    // Check liked products
    const checkLikedStatus = async () => {
      setIsCheckingLiked(true)
      try {
        if (isLoggedIn()) {
          // User is logged in, check API
          const likedIds = await getLikedProductIdsFromAPI()
          setIsLiked(likedIds.includes(product.id))
        } else {
          // User is not logged in, check cookies
          setIsLiked(isLikedCookie(product.id))
        }
      } catch (error) {
        console.error("Error checking liked status:", error)
        // Fallback to cookies if API fails
        setIsLiked(isLikedCookie(product.id))
      } finally {
        setIsCheckingLiked(false)
      }
    }

    checkLikedStatus()
  }, [product.id])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (isLoggedIn()) {
        // User is logged in, use API
        if (isLiked) {
          const success = await removeFromLikedAPI(product.id)
          if (success) {
            setIsLiked(false)
          }
        } else {
          const success = await addToLikedAPI(product.id)
          if (success) {
            setIsLiked(true)
          }
        }
      } else {
        // User is not logged in, use cookies
        if (isLiked) {
          removeFromLikedCookie(product.id)
          setIsLiked(false)
        } else {
          addToLikedCookie(product.id)
          setIsLiked(true)
        }
      }
    } catch (error) {
      console.error("Failed to like/unlike product:", error)
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
