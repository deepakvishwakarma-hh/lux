"use client"

import React, { useMemo, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { FilterProductsResponse } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import PreviewPrice from "@modules/products/components/product-preview/price"
import AddToCartButton from "@modules/products/components/product-preview/add-to-cart-button"
import HoverActions from "@modules/products/components/product-preview/hover-actions"
import { getProductPrice } from "@lib/util/get-product-price"
import Image from "next/image"
import FilterSidebar from "@modules/products/templates/filter-page/components/filter-sidebar"
import { usePriceRange } from "@modules/products/templates/filter-page/hooks/use-price-range"
import GridLayoutSelector from "@modules/products/components/grid-layout-selector"

// Client-side product preview component
function ProductPreviewClient({
  product,
  region,
  countryCode,
  gridLayout = "grid-4",
}: {
  product: any
  region: HttpTypes.StoreRegion
  countryCode: string
  gridLayout?: "grid-1" | "grid-2" | "grid-3" | "grid-4"
}) {
  const isList = gridLayout === "grid-1"
  // Convert filter API product format to match expected format
  const formattedProduct: HttpTypes.StoreProduct = {
    ...product,
    variants: product.variants?.map((v: any) => ({
      ...v,
      calculated_price: v.price
        ? {
            calculated_amount: v.price,
            currency_code: product.currency_code || "USD",
            original_amount: v.price,
            calculated_price: {
              price_list_type: "sale",
            },
          }
        : undefined,
    })),
  }

  // Get price for display - try multiple methods
  let cheapestPrice: any = null
  
  // Method 1: Try using getProductPrice utility if product has proper structure
  try {
    if (formattedProduct.id && formattedProduct.variants?.length > 0) {
      const priceResult = getProductPrice({ product: formattedProduct })
      if (priceResult.cheapestPrice) {
        cheapestPrice = priceResult.cheapestPrice
      }
    }
  } catch (e) {
    // Ignore errors and try other methods
  }
  
  // Method 2: Check variants for calculated_price (from API)
  if (!cheapestPrice && product.variants && product.variants.length > 0) {
    const variantWithPrice = product.variants.find((v: any) => v.calculated_price?.calculated_amount)
    if (variantWithPrice) {
      const price = variantWithPrice.calculated_price
      cheapestPrice = {
        calculated_price_number: price.calculated_amount,
        calculated_price: price.calculated_price?.formatted || `$${(price.calculated_amount / 100).toFixed(2)}`,
        original_price_number: price.original_amount,
        original_price: price.original_price?.formatted || `$${(price.original_amount / 100).toFixed(2)}`,
        currency_code: price.currency_code || "USD",
        price_type: price.calculated_price?.price_list_type || "default",
        percentage_diff: price.original_amount && price.calculated_amount && price.original_amount > price.calculated_amount
          ? Math.round(((price.original_amount - price.calculated_amount) / price.original_amount) * 100)
          : null,
      }
    }
  }
  
  // Method 3: Check if variants have price property (from filter API)
  if (!cheapestPrice && product.variants && product.variants.length > 0) {
    const variantsWithPrice = product.variants
      .filter((v: any) => v.price !== null && v.price !== undefined)
      .sort((a: any, b: any) => a.price - b.price)
    
    if (variantsWithPrice.length > 0) {
      const cheapestVariant = variantsWithPrice[0]
      const priceAmount = cheapestVariant.price / 100 // Convert from cents
      cheapestPrice = {
        calculated_price_number: priceAmount,
        calculated_price: cheapestVariant.price_formatted || `$${priceAmount.toFixed(2)}`,
        original_price_number: priceAmount,
        original_price: cheapestVariant.price_formatted || `$${priceAmount.toFixed(2)}`,
        currency_code: product.currency_code || cheapestVariant.currency_code || "USD",
        price_type: "default",
        percentage_diff: null,
      }
    }
  }
  
  // Method 4: Fallback to product.price if no variant prices found
  if (!cheapestPrice && product.price !== null && product.price !== undefined) {
    const priceAmount = product.price / 100 // Convert from cents
    cheapestPrice = {
      calculated_price_number: priceAmount,
      calculated_price: product.price_formatted || `$${priceAmount.toFixed(2)}`,
      original_price_number: priceAmount,
      original_price: product.price_formatted || `$${priceAmount.toFixed(2)}`,
      currency_code: product.currency_code || "USD",
      price_type: "default",
      percentage_diff: null,
    }
  }

  // Basic stock detection
  const firstVariant = product.variants?.[0]
  const inStock = (() => {
    if (!firstVariant) return false
    if (!firstVariant.manage_inventory) return true
    if (firstVariant.allow_backorder) return true
    if ((firstVariant.inventory_quantity || 0) > 0) return true
    return false
  })()

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className={`group ${isList ? 'w-full' : 'h-full'}`}>
      <div
        data-testid="product-wrapper"
        className={`shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150 ${
          isList 
            ? 'relative flex flex-row gap-4 items-start p-4 sm:p-5 border border-gray-100 rounded-lg bg-white' 
            : 'overflow-hidden relative h-full flex flex-col'
        }`}
      >
        {cheapestPrice &&
          cheapestPrice.price_type === "sale" &&
          cheapestPrice.percentage_diff && (
            <div className={`absolute z-10 bg-black text-white px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold ${
              isList ? 'top-2 left-2' : 'top-2 left-2'
            }`}>
              -{cheapestPrice.percentage_diff}%
            </div>
          )}
        <HoverActions product={formattedProduct} />
        
        {isList ? (
          <div className="w-40 sm:w-48 h-40 sm:h-48 flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center bg-gray-50 relative">
            {product.thumbnail || product.images?.[0]?.url ? (
              <Image
                src={product.thumbnail || product.images?.[0]?.url}
                alt={product.title}
                fill
                className="object-contain p-2"
                sizes="(max-width: 640px) 160px, 192px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-shrink-0">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
            />
          </div>
        )}

        <div className={`flex flex-col txt-compact-medium ${
          isList 
            ? 'flex-1 justify-between px-0 py-0' 
            : 'mt-3 justify-between px-4 pb-4 flex-1'
        }`}>
          <div className={isList ? 'space-y-2' : 'space-y-1'}>
            {product.brand && (
              <p className={`${
                isList 
                  ? 'text-left text-sm text-gray-500 font-medium uppercase tracking-wide font-urbanist' 
                  : 'text-ui-fg-subtle text-center font-semibold text-xs uppercase tracking-wide font-urbanist'
              }`}>
                {product.brand.name}
              </p>
            )}
            <p
              className={`${
                isList
                  ? 'text-left text-base sm:text-lg font-semibold text-gray-900 leading-tight font-urbanist'
                  : 'text-gray-900 text-center text-sm font-medium leading-tight max-h-12 overflow-hidden font-urbanist'
              }`}
              data-testid="product-title"
            >
              {product.title}
            </p>
            {isList && product.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
            )}
          </div>
          
          {isList ? (
            <div className="flex items-center justify-between gap-4 w-full mt-4">
              <div className="flex flex-col">
                {cheapestPrice && (
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {cheapestPrice.calculated_price}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                {inStock ? (
                  <AddToCartButton
                    product={formattedProduct}
                    countryCode={countryCode}
                  />
                ) : (
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-md font-medium">
                    Out of stock
                  </span>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-x-2 mt-2">
                {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
              </div>
              <div className="mt-3">
                <AddToCartButton
                  product={formattedProduct}
                  countryCode={countryCode}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}

type CategoryPageProps = {
  countryCode: string
  region: HttpTypes.StoreRegion
  categoryName: string
  categoryDescription?: string
  parentCategories?: Array<{ name: string; handle: string }>
  categoryChildren?: Array<{ id: string; name: string; handle: string }>
  initialData?: FilterProductsResponse
}

// Fetcher function for useSWR
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

export default function CategoryPage({
  countryCode,
  region,
  categoryName,
  categoryDescription,
  parentCategories,
  categoryChildren,
  initialData,
}: CategoryPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [gridLayout, setGridLayout] = useState<"grid-1" | "grid-2" | "grid-3" | "grid-4">("grid-4")

  // Memoize filter values to prevent unnecessary re-renders
  const filters = useMemo(() => {
    const pageParam = searchParams.get("page")
    const page = pageParam ? parseInt(pageParam) : 1
    
    return {
      brand: searchParams.get("brand") || "",
      rimStyle: searchParams.getAll("rim_style"),
      gender: searchParams.getAll("gender"),
      shapes: searchParams.getAll("shapes"),
      size: searchParams.getAll("size"),
      frameMaterial: searchParams.getAll("frame_material"),
      shapeFilter: searchParams.getAll("shape_filter"),
      shape: searchParams.getAll("shape"),
      minPrice: searchParams.get("min_price"),
      maxPrice: searchParams.get("max_price"),
      order: searchParams.get("order") || "created_at",
      orderDirection: searchParams.get("order_direction") || "desc",
      page,
    }
  }, [searchParams])

  // Build API URL - always filter by category_name
  const apiUrl = useMemo(() => {
    const queryParams = new URLSearchParams()
    queryParams.set("category_name", categoryName) // Always filter by category
    if (filters.brand) queryParams.set("brand_slug", filters.brand)
    filters.rimStyle.forEach((v) => queryParams.append("rim_style", v))
    filters.gender.forEach((v) => queryParams.append("gender", v))
    filters.shapes.forEach((v) => queryParams.append("shapes", v))
    filters.size.forEach((v) => queryParams.append("size", v))
    filters.frameMaterial.forEach((v) => queryParams.append("frame_material", v))
    filters.shapeFilter.forEach((v) => queryParams.append("shape_filter", v))
    filters.shape.forEach((v) => queryParams.append("shape", v))
    if (filters.minPrice) queryParams.set("min_price", filters.minPrice)
    if (filters.maxPrice) queryParams.set("max_price", filters.maxPrice)
    queryParams.set("order", filters.order)
    queryParams.set("order_direction", filters.orderDirection)
    queryParams.set("limit", "20")
    queryParams.set("offset", String((filters.page - 1) * 20))
    queryParams.set("include_filter_options", "true")

    const backendUrl = process.env.MEDUSA_BACKEND_URL
    if (!backendUrl) {
      return null
    }
    
    return `${backendUrl}/store/products/filter?${queryParams.toString()}`
  }, [filters, categoryName])

  // Use SWR to fetch data
  const { data, error, isLoading, mutate } = useSWR<FilterProductsResponse>(
    apiUrl,
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  )

  const products = data?.products || []
  const count = data?.count || 0
  const filterOptions = data?.filter_options
  const loading = isLoading

  const { priceRange, priceValues, handlePriceChange } = usePriceRange({
    products,
    minPriceFilter: filters.minPrice,
    maxPriceFilter: filters.maxPrice,
    onPriceChange: (minCents, maxCents) => {
      updateFilters({ min_price: String(minCents), max_price: String(maxCents) })
    },
  })

  useEffect(() => {
    if (typeof document === "undefined") return
    if (showMobileFilters) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [showMobileFilters])

  // Update URL with filters
  const updateFilters = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Reset to first page when filters change (except when updating page itself)
    if (!updates.page) {
      params.delete("page")
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        params.delete(key)
      } else if (Array.isArray(value)) {
        params.delete(key)
        value.forEach((v) => params.append(key, v))
      } else {
        params.set(key, value)
      }
    })

    router.push(`?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: string, isMulti = false) => {
    if (isMulti) {
      const current = searchParams.getAll(key)
      const newValue = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      updateFilters({ [key]: newValue })
    } else {
      updateFilters({ [key]: value || null })
    }
  }

  const handleSortChange = (order: string, direction: string) => {
    updateFilters({ order, order_direction: direction })
  }

  const clearFilters = () => {
    router.push("?")
  }

  return (
    <div className="px-5 pb-8">
      {/* Category Header */}
      <div className="mb-12 pb-8 border-b border-gray-200 bg-gray-100 pt-8">
        <div className="flex flex-col items-center gap-6">
          {/* Breadcrumbs */}
          {parentCategories && parentCategories.length > 0 && (
            <div className="flex flex-row text-sm gap-2 mb-2">
              {parentCategories.map((parent, index) => (
                <React.Fragment key={parent.handle}>
                  <LocalizedClientLink
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    href={`/categories/${parent.handle}`}
                  >
                    {parent.name}
                  </LocalizedClientLink>
                  {index < parentCategories.length - 1 && (
                    <span className="text-gray-400">/</span>
                  )}
                </React.Fragment>
              ))}
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{categoryName}</span>
            </div>
          )}

          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold leading-tight text-gray-900 font-urbanist">
              {categoryName}
            </h1>

            {categoryDescription && (
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {categoryDescription}
              </p>
            )}

            <div className="pt-2">
              <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider font-urbanist">
                {loading ? "Loading..." : `${count} ${count === 1 ? "product" : "products"} available`}
              </p>
            </div>
          </div>

          {/* Subcategories */}
          {categoryChildren && categoryChildren.length > 0 && (
            <div className="mt-6 w-full max-w-3xl">
              <h2 className="text-sm font-semibold mb-3 text-gray-700 uppercase tracking-wider font-urbanist">Subcategories</h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categoryChildren.map((child) => (
                  <li key={child.id}>
                    <LocalizedClientLink
                      href={`/categories/${child.handle}`}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                    >
                      {child.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Drawer */}
        {showMobileFilters && (
          <div
            id="mobile-filter-drawer"
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 lg:hidden"
            style={{ zIndex: 9998 }}
          >
            <div
              className="fixed inset-0 bg-black bg-opacity-40"
              onClick={() => setShowMobileFilters(false)}
              style={{ zIndex: 9998 }}
            />

            <div className={`fixed top-0 left-0 h-full w-80 max-w-[85%] bg-white shadow-xl transform transition-transform`} style={{ zIndex: 9999 }}>
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 font-urbanist">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Close filters"
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="h-full overflow-auto p-4">
                <FilterSidebar
                  filters={{
                    brand: filters.brand ? [filters.brand] : [],
                    category: [],
                    rimStyle: filters.rimStyle,
                    gender: filters.gender,
                    shapes: filters.shapes,
                    size: filters.size,
                    frameMaterial: filters.frameMaterial,
                    shapeFilter: filters.shapeFilter,
                    shape: filters.shape,
                    minPrice: filters.minPrice || undefined,
                    maxPrice: filters.maxPrice || undefined,
                  }}
                  filterOptions={filterOptions}
                  priceRange={priceRange}
                  priceValues={priceValues}
                  onPriceChange={handlePriceChange}
                  onFilterChange={handleFilterChange}
                  onClearFilters={() => { clearFilters(); setShowMobileFilters(false) }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Filters - visible on lg and up */}
        <aside className="hidden lg:block lg:w-72 flex-shrink-0 self-start lg:sticky lg:top-20" style={{ zIndex: 20 }}>
          <FilterSidebar
            filters={{
              brand: filters.brand ? [filters.brand] : [],
              category: [],
              rimStyle: filters.rimStyle,
              gender: filters.gender,
              shapes: filters.shapes,
              size: filters.size,
              frameMaterial: filters.frameMaterial,
              shapeFilter: filters.shapeFilter,
              shape: filters.shape,
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
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort and Results Count */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <p className="text-sm sm:text-base font-medium text-gray-700 text-center sm:text-left font-urbanist">
                {loading ? (
                  <span className="text-gray-500">Loading...</span>
                ) : (
                  <span>
                    <span className="font-semibold text-gray-900">{count}</span>{" "}
                    {count === 1 ? "product" : "products"} found
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors lg:hidden flex-shrink-0 font-medium text-sm font-urbanist"
                aria-label="Open filters"
                aria-haspopup="dialog"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Filters</span>
              </button>
              <label className="text-sm font-medium text-gray-700 hidden sm:inline font-urbanist">
                Sort by:
              </label>
              <select
                value={`${filters.order}_${filters.orderDirection}`}
                onChange={(e) => {
                  const [order, direction] = e.target.value.split("_")
                  handleSortChange(order, direction)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 w-full sm:w-auto flex-1 sm:flex-none min-w-[180px] text-sm font-medium font-urbanist"
              >
                <option value="created_at_desc">Newest First</option>
                <option value="created_at_asc">Oldest First</option>
                <option value="title_asc">Name A-Z</option>
                <option value="title_desc">Name Z-A</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <GridLayoutSelector value={gridLayout} onChange={setGridLayout} storageKey="category-grid-layout" />
            </div>
          </div>

          {/* Products Grid */}
          {error ? (
            <div className="text-center py-16">
              <p className="text-red-600 font-medium mb-4 font-urbanist">
                Error loading products. Please try again.
              </p>
              <button
                onClick={() => mutate()}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm font-urbanist"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-medium font-urbanist">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-medium text-lg font-urbanist">No products found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              gridLayout === "grid-1" ? "grid-cols-1" :
              gridLayout === "grid-2" ? "grid-cols-1 sm:grid-cols-2" :
              gridLayout === "grid-3" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}>
              {products.map((product: any) => (
                <ProductPreviewClient
                  key={product.id}
                  product={product}
                  region={region}
                  countryCode={countryCode}
                  gridLayout={gridLayout}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {count > 20 && (
            <div className="flex justify-center items-center gap-3 mt-12 pt-8 border-t border-gray-200">
              <button
                onClick={() =>
                  updateFilters({ page: String(Math.max(1, filters.page - 1)) })
                }
                disabled={filters.page === 1}
                className="px-5 py-2.5 border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-sm font-urbanist"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 font-urbanist">
                Page <span className="font-semibold">{filters.page}</span> of{" "}
                <span className="font-semibold">{Math.ceil(count / 20)}</span>
              </span>
              <button
                onClick={() =>
                  updateFilters({ page: String(filters.page + 1) })
                }
                disabled={filters.page >= Math.ceil(count / 20)}
                className="px-5 py-2.5 border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-sm font-urbanist"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

