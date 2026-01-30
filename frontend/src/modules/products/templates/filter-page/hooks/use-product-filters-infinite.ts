"use client"

import { useMemo, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWRInfinite from "swr/infinite"
import { FilterProductsResponse } from "@lib/data/products"

/**
 * Get backend URL for client-side requests
 */
function getBackendUrl(): string {
  if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  }
  
  if (typeof window !== "undefined") {
    if (window.location.origin.includes("localhost")) {
      return "http://localhost:9000"
    }
    return window.location.origin.replace(/:\d+$/, ":9000")
  }
  return "http://localhost:9000"
}

const fetcher = async (url: string): Promise<FilterProductsResponse> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY && {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
      }),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`)
  }

  return response.json()
}

export type ProductFiltersInfiniteParams = {
  // Optional fixed filters (always applied)
  brandSlug?: string
  categoryName?: string
  search?: string
  
  // Dynamic filters from URL
  brand?: string[]
  category?: string[]
  rimStyle?: string[]
  gender?: string[]
  shapes?: string[]
  size?: string[]
  frameMaterial?: string[]
  shapeFilter?: string[]
  shape?: string[]
  minPrice?: string | null
  maxPrice?: string | null
  order?: string
  orderDirection?: string
}

const PAGE_SIZE = 20

/**
 * Optimized infinite scroll hook for product listings
 * Supports brand pages, category pages, and general filter pages
 */
export function useProductFiltersInfinite(
  filters: ProductFiltersInfiniteParams,
  initialData?: FilterProductsResponse
) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Build base API URL (without pagination params)
  const baseUrl = useMemo(() => {
    const queryParams = new URLSearchParams()
    
    // Fixed filters (always applied)
    if (filters.brandSlug) queryParams.set("brand_slug", filters.brandSlug)
    if (filters.categoryName) queryParams.set("category_name", filters.categoryName)
    if (filters.search) queryParams.set("search", filters.search)
    
    // Dynamic filters
    filters.brand?.forEach((v) => queryParams.append("brand_slug", v))
    filters.category?.forEach((v) => queryParams.append("category_name", v))
    filters.rimStyle?.forEach((v) => queryParams.append("rim_style", v))
    filters.gender?.forEach((v) => queryParams.append("gender", v))
    filters.shapes?.forEach((v) => queryParams.append("shapes", v))
    filters.size?.forEach((v) => queryParams.append("size", v))
    filters.frameMaterial?.forEach((v) => queryParams.append("frame_material", v))
    filters.shapeFilter?.forEach((v) => queryParams.append("shape_filter", v))
    filters.shape?.forEach((v) => queryParams.append("shape", v))
    
    if (filters.minPrice) queryParams.set("min_price", filters.minPrice)
    if (filters.maxPrice) queryParams.set("max_price", filters.maxPrice)
    queryParams.set("order", filters.order || "created_at")
    queryParams.set("order_direction", filters.orderDirection || "desc")
    queryParams.set("limit", String(PAGE_SIZE))
    queryParams.set("include_filter_options", "true")

    const backendUrl = getBackendUrl()
    return `${backendUrl}/store/products/filter?${queryParams.toString()}`
  }, [
    filters.brandSlug,
    filters.categoryName,
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

  // Track previous baseUrl to detect filter changes
  const prevBaseUrlRef = useRef<string | null>(baseUrl)

  // Build the first page URL for fallback data
  const firstPageUrl = useMemo(() => {
    if (!baseUrl) return null
    const url = new URL(baseUrl)
    url.searchParams.set("offset", "0")
    return url.toString()
  }, [baseUrl])

  // Use SWR Infinite - each page fetches only that page's products
  const {
    data: pagesData,
    error,
    mutate,
    size,
    setSize,
    isValidating,
    isLoading,
  } = useSWRInfinite<FilterProductsResponse>(
    (pageIndex, previousPageData) => {
      // Stop fetching if previous page returned no products
      if (previousPageData && (!previousPageData.products || previousPageData.products.length === 0)) {
        return null
      }

      if (!baseUrl) return null

      // Calculate offset: pageIndex 0 = offset 0, pageIndex 1 = offset 20, etc.
      const offset = pageIndex * PAGE_SIZE
      const url = new URL(baseUrl)
      url.searchParams.set("offset", String(offset))
      return url.toString()
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      initialSize: 1,
      fallback: firstPageUrl && initialData ? { [firstPageUrl]: initialData } : undefined,
    }
  )

  // Reset pagination when filters change (baseUrl changes)
  useEffect(() => {
    if (prevBaseUrlRef.current !== null && prevBaseUrlRef.current !== baseUrl) {
      setSize(1)
    }
    prevBaseUrlRef.current = baseUrl
  }, [baseUrl, setSize])

  // Accumulate all products from all pages for display
  const allProducts = pagesData ? pagesData.flatMap((page) => page?.products || []) : []
  
  // Get count and filter options from first page
  const count = pagesData?.[0]?.count || 0
  const filterOptions = pagesData?.[0]?.filter_options

  // Calculate loading states
  // isLoadingMore: true when validating and we already have at least one page loaded
  // This means we're loading additional pages, not the initial load
  const isLoadingMore = isValidating && (pagesData?.length || 0) > 0
  // isEmpty: true when first page has no products
  const isEmpty = pagesData?.[0]?.products?.length === 0
  // isReachingEnd: true when last page has fewer products than PAGE_SIZE
  const lastPage = pagesData?.[pagesData.length - 1]
  const isReachingEnd = 
    isEmpty || 
    (lastPage && lastPage.products && lastPage.products.length < PAGE_SIZE)

  // Create a single data object that matches the old structure for compatibility
  const data: FilterProductsResponse | undefined = pagesData?.[0]
    ? {
        ...pagesData[0],
        products: allProducts,
      }
    : initialData && allProducts.length === 0
    ? initialData
    : undefined

  // Update URL with filters
  const updateFilters = useCallback((updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    if (!updates.page) {
      params.delete("page")
      setSize(1)
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key)
      } else if (Array.isArray(value)) {
        params.delete(key)
        value.forEach((v) => params.append(key, v))
      } else {
        params.set(key, value)
      }
    })

    router.push(`?${params.toString()}`)
  }, [searchParams, router, setSize])

  const handleFilterChange = useCallback((key: string, value: string, isMulti = false) => {
    if (isMulti) {
      const current = searchParams.getAll(key)
      const newValue = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      updateFilters({ [key]: newValue })
    } else {
      updateFilters({ [key]: value || null })
    }
  }, [searchParams, updateFilters])

  const handleSortChange = useCallback((order: string, direction: string) => {
    updateFilters({ order, order_direction: direction })
  }, [updateFilters])

  const clearFilters = useCallback(() => {
    router.push("?")
    setSize(1)
  }, [router, setSize])

  // Track if we're currently loading to prevent duplicate requests
  const loadingRef = useRef(false)

  // Load more products (increment page) - memoized to prevent recreating
  const loadMore = useCallback(() => {
    if (loadingRef.current || isLoadingMore || isReachingEnd || !baseUrl) {
      return
    }
    
    loadingRef.current = true
    setSize((prevSize) => prevSize + 1)
  }, [isLoadingMore, isReachingEnd, baseUrl, setSize])

  // Reset loading flag when loading completes or when we reach the end
  useEffect(() => {
    if (!isLoadingMore && !isValidating) {
      loadingRef.current = false
    }
    if (isReachingEnd) {
      loadingRef.current = false
    }
  }, [isLoadingMore, isValidating, isReachingEnd])

  return {
    data,
    error,
    isLoading,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
    mutate,
    updateFilters,
    handleFilterChange,
    handleSortChange,
    clearFilters,
    loadMore,
    currentPage: size,
    products: allProducts,
    count,
    filterOptions,
  }
}
