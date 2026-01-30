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
      <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full border-2 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-700 text-base font-medium">Loading products...</p>
        </div>
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

  // Responsive grid columns per view mode to ensure good layout across screen sizes
  const gridColsClass = {
    list: "grid-cols-1",
    // 2-col always
    "grid-2": "grid-cols-2",
    // on small screens show 2-col, on md show 3
    "grid-3": "grid-cols-2 md:grid-cols-3",
    // 2 on small, 3 on md, 4 on lg
    "grid-4": "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
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

