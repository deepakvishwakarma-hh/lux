"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { FilterProductsResponse } from "@lib/data/products"
import LoadingOverlay from "./components/loading-overlay"
import SearchQueryIndicator from "./components/search-query-indicator"
import FilterSidebar from "./components/filter-sidebar"
import SortControls from "./components/sort-controls"
import ProductGrid from "./components/product-grid"
import Pagination from "./components/pagination"
import { useFilterParams } from "./hooks/use-filter-params"
import { useProductFilters } from "./hooks/use-product-filters"
import { usePriceRange } from "./hooks/use-price-range"

type FilterPageProps = {
  countryCode: string
  region: HttpTypes.StoreRegion
  initialData?: FilterProductsResponse
}

export default function FilterPage({
  countryCode,
  region,
  initialData,
}: FilterPageProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const filters = useFilterParams()

  const {
    data,
    error,
    isLoading,
    mutate,
    updateFilters,
    handleFilterChange,
    handleSortChange,
    clearFilters,
  } = useProductFilters(filters, initialData)

  const products = data?.products || []
  const count = data?.count || 0
  const filterOptions = data?.filter_options

  const { priceRange, priceValues, handlePriceChange } = usePriceRange({
    products,
    minPriceFilter: filters.minPrice,
    maxPriceFilter: filters.maxPrice,
    onPriceChange: (minCents, maxCents) => {
      updateFilters({
        min_price: String(minCents),
        max_price: String(maxCents),
      })
    },
  })

  const handlePageChange = (page: number) => {
    updateFilters({ page: String(page) })
  }

  const totalPages = Math.ceil(count / 20)

  return (
    <div className="relative">
      <LoadingOverlay isLoading={isLoading} />
      <SearchQueryIndicator searchQuery={filters.search} />
      <div className="content-container py-4 sm:py-6 md:py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4 flex items-center gap-2">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {/* Sidebar - Hidden on mobile by default */}
          <div className={`${showMobileFilters ? "block" : "hidden"} lg:block lg:w-72 flex-shrink-0`}>
            <FilterSidebar
              filters={{
                brand: filters.brand,
                category: filters.category,
                rimStyle: filters.rimStyle,
                gender: filters.gender,
                shapes: filters.shapes,
                size: filters.size,
                minPrice: filters.minPrice || undefined,
                maxPrice: filters.maxPrice || undefined,
              }}
              filterOptions={filterOptions}
              priceRange={priceRange}
              priceValues={priceValues}
              onPriceChange={handlePriceChange}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <SortControls
              count={count}
              isLoading={isLoading}
              order={filters.order}
              orderDirection={filters.orderDirection}
              onSortChange={handleSortChange}
            />
            <ProductGrid
              products={products}
              region={region}
              countryCode={countryCode}
              isLoading={isLoading}
              error={error}
              onRetry={() => mutate()}
            />
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
