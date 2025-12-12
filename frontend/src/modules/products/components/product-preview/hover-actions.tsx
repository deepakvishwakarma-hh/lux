"use client"

import { HttpTypes } from "@medusajs/types"
import { useState, useEffect } from "react"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import { useRouter } from "next/navigation"

type HoverActionsProps = {
  product: HttpTypes.StoreProduct
}

export default function HoverActions({ product }: HoverActionsProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [isInCompare, setIsInCompare] = useState(false)

  // Check if product is liked or in compare on mount
  useEffect(() => {
    // Check liked products (would need API call)
    // For now, we'll skip this check

    // Check compare products from localStorage
    const compareItems = JSON.parse(
      localStorage.getItem("compareProducts") || "[]"
    )
    setIsInCompare(compareItems.some((item: any) => item.id === product.id))
  }, [product.id])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      // TODO: Implement like API call
      // const response = await fetch("/store/liked-products", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ product_id: product.id }),
      // })
      setIsLiked(!isLiked)
    } catch (error) {
      console.error("Failed to like product:", error)
    }
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const compareItems = JSON.parse(
      localStorage.getItem("compareProducts") || "[]"
    )

    if (isInCompare) {
      // Remove from compare
      const updated = compareItems.filter((item: any) => item.id !== product.id)
      localStorage.setItem("compareProducts", JSON.stringify(updated))
      setIsInCompare(false)
    } else {
      // Add to compare
      const updated = [
        ...compareItems,
        {
          id: product.id,
          title: product.title,
          handle: product.handle,
          thumbnail: product.thumbnail,
        },
      ]
      localStorage.setItem("compareProducts", JSON.stringify(updated))
      setIsInCompare(true)
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
        className="bg-white rounded-full p-2"
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
        className="bg-white rounded-full p-2"
        aria-label="Like product"
        data-testid="like-button"
      >
        <WoodMartIcon iconContent="f106" size={16} />
      </button>
    </div>
  )
}
