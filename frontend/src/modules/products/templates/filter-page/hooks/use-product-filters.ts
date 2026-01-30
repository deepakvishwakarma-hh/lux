"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { FilterProductsResponse } from "@lib/data/products"
import { useProductFiltersInfinite, ProductFiltersInfiniteParams } from "./use-product-filters-infinite"

type FilterParams = {
  search: string
  brand: string[]
  category: string[]
  rimStyle: string[]
  gender: string[]
  shapes: string[]
  size: string[]
  frameMaterial: string[]
  shapeFilter: string[]
  shape: string[]
  minPrice?: string | null
  maxPrice?: string | null
  order: string
  orderDirection: string
  page: number
}

/**
 * Wrapper hook for filter page that uses the optimized infinite scroll hook
 */
export function useProductFilters(
  filters: FilterParams,
  initialData?: FilterProductsResponse
) {
  const searchParams = useSearchParams()

  // Convert FilterParams to ProductFiltersInfiniteParams
  const infiniteFilters: ProductFiltersInfiniteParams = useMemo(() => ({
    search: filters.search || undefined,
    brand: filters.brand,
    category: filters.category,
    rimStyle: filters.rimStyle,
    gender: filters.gender,
    shapes: filters.shapes,
    size: filters.size,
    frameMaterial: filters.frameMaterial,
    shapeFilter: filters.shapeFilter,
    shape: filters.shape,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    order: filters.order,
    orderDirection: filters.orderDirection,
  }), [
    filters.search,
    filters.brand,
    filters.category,
    filters.rimStyle,
    filters.gender,
    filters.shapes,
    filters.size,
    filters.frameMaterial,
    filters.shapeFilter,
    filters.shape,
    filters.minPrice,
    filters.maxPrice,
    filters.order,
    filters.orderDirection,
  ])

  const result = useProductFiltersInfinite(infiniteFilters, initialData)

  // Return in the same format for backward compatibility
  return {
    ...result,
    data: result.data,
  }
}

