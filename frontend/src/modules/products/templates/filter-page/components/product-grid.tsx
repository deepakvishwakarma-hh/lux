"use client"

import { HttpTypes } from "@medusajs/types"
import ProductPreview from "./product-preview"

type ProductGridProps = {
  products: any[]
  region: HttpTypes.StoreRegion
  countryCode: string
  isLoading: boolean
  error: Error | undefined
  viewMode?: "list" | "grid-2" | "grid-3" | "grid-4"
  onRetry: () => void
}

export default function ProductGrid({
  products,
  region,
  countryCode,
  isLoading,
  error,
  viewMode = "grid-3",
  onRetry,
}: ProductGridProps) {
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-ui-fg-destructive">Error loading products. Please try again.</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-ui-bg-interactive text-ui-fg-on-interactive rounded-md hover:bg-ui-bg-interactive-hover"
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-ui-fg-subtle">Loading products...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ui-fg-subtle">No products found</p>
      </div>
    )
  }

  const gridColsClass = {
    list: "grid-cols-1",
    "grid-2": "grid-cols-2",
    "grid-3": "grid-cols-3",
    "grid-4": "grid-cols-4",
  }[viewMode] || "grid-cols-3"

  return (
    <div className={`grid ${gridColsClass} gap-3 sm:gap-4 md:gap-5 lg:gap-6`}>
      {products.map((product: any) => (
        <ProductPreview
          key={product.id}
          product={product}
          region={region}
          countryCode={countryCode}
          viewMode={viewMode}
        />
      ))}
    </div>
  )
}

