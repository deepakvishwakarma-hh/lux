"use client"

import React, { useMemo, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { Range, getTrackBackground } from "react-range"
import { FilterProductsResponse } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import PreviewPrice from "@modules/products/components/product-preview/price"
import AddToCartButton from "@modules/products/components/product-preview/add-to-cart-button"
import HoverActions from "@modules/products/components/product-preview/hover-actions"
import { getProductPrice } from "@lib/util/get-product-price"

// Client-side product preview component
function ProductPreviewClient({
  product,
  region,
  countryCode,
}: {
  product: any
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
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

  // Get price for display
  let cheapestPrice: any = null
  if (product.price !== null && product.price !== undefined) {
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

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div
        data-testid="product-wrapper"
        className="shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150 overflow-hidden relative"
      >
        {cheapestPrice &&
          cheapestPrice.price_type === "sale" &&
          cheapestPrice.percentage_diff && (
            <div className="absolute top-2 left-2 z-10 bg-black text-white px-2 py-1 rounded-full text-[11px] font-semibold">
              -{cheapestPrice.percentage_diff}%
            </div>
          )}
        <HoverActions product={formattedProduct} />
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
        />
        <div className="flex flex-col txt-compact-medium mt-4 justify-between px-4 pb-4">
          <p
            className="text-ui-fg-subtle text-center"
            data-testid="product-title"
          >
            {product.title}
          </p>
          {product.brand && (
            <p className="text-ui-fg-subtle text-center font-bold">
              {product.brand.name}
            </p>
          )}
          <div className="flex items-center justify-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
          <AddToCartButton
            product={formattedProduct}
            countryCode={countryCode}
          />
        </div>
      </div>
    </LocalizedClientLink>
  )
}

type FilterPageProps = {
  countryCode: string
  region: HttpTypes.StoreRegion
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

export default function FilterPage({
  countryCode,
  region,
  initialData,
}: FilterPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Memoize filter values to prevent unnecessary re-renders
  const filters = useMemo(() => {
    const pageParam = searchParams.get("page")
    const page = pageParam ? parseInt(pageParam) : 1

    return {
      search: searchParams.get("search") || "",
      brand: searchParams.getAll("brand"),
      category: searchParams.getAll("category"),
      rimStyle: searchParams.getAll("rim_style"),
      gender: searchParams.getAll("gender"),
      shapes: searchParams.getAll("shapes"),
      size: searchParams.getAll("size"),
      minPrice: searchParams.get("min_price"),
      maxPrice: searchParams.get("max_price"),
      order: searchParams.get("order") || "created_at",
      orderDirection: searchParams.get("order_direction") || "desc",
      page,
    }
  }, [searchParams])

  // Build API URL
  const apiUrl = useMemo(() => {
    const queryParams = new URLSearchParams()
    if (filters.search) queryParams.set("search", filters.search)
    filters.brand.forEach((v) => queryParams.append("brand_slug", v))
    filters.category.forEach((v) => queryParams.append("category_name", v))
    filters.rimStyle.forEach((v) => queryParams.append("rim_style", v))
    filters.gender.forEach((v) => queryParams.append("gender", v))
    filters.shapes.forEach((v) => queryParams.append("shapes", v))
    filters.size.forEach((v) => queryParams.append("size", v))
    if (filters.minPrice) queryParams.set("min_price", filters.minPrice)
    if (filters.maxPrice) queryParams.set("max_price", filters.maxPrice)
    queryParams.set("order", filters.order)
    queryParams.set("order_direction", filters.orderDirection)
    queryParams.set("limit", "20")
    queryParams.set("offset", String((filters.page - 1) * 20))
    queryParams.set("include_filter_options", "true")

    const backendUrl =
      typeof window !== "undefined"
        ? window.location.origin.includes("localhost")
          ? "http://localhost:9000"
          : window.location.origin.replace(/:\d+$/, ":9000")
        : process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

    return `${backendUrl}/store/products/filter?${queryParams.toString()}`
  }, [filters])

  // Use SWR to fetch data
  const { data, error, isLoading, mutate } = useSWR<FilterProductsResponse>(
    apiUrl,
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
    }
  )

  const products = data?.products || []
  const count = data?.count || 0
  const filterOptions = data?.filter_options
  const loading = isLoading

  // Calculate price range from products (prices are in cents, convert to dollars)
  const priceRange = useMemo(() => {
    const prices = products
      .map((p: any) => p.price)
      .filter((p: number | null | undefined) => p != null && p !== undefined)
      .map((p: number) => p / 100) // Convert from cents to dollars

    if (prices.length === 0) {
      return { min: 0, max: 1000 } // Default range if no products
    }

    const min = Math.floor(Math.min(...prices))
    const max = Math.ceil(Math.max(...prices))

    // Ensure we have a reasonable range
    const rangeMin = Math.max(0, min)
    const rangeMax = Math.max(rangeMin + 10, max)

    return { min: rangeMin, max: rangeMax }
  }, [products])

  // Initialize price range state
  const [priceValues, setPriceValues] = useState<number[]>(() => {
    const min = filters.minPrice ? parseFloat(filters.minPrice) : priceRange.min
    const max = filters.maxPrice ? parseFloat(filters.maxPrice) : priceRange.max
    return [min, max]
  })

  // Update price values when filters or price range changes
  useEffect(() => {
    let min = filters.minPrice ? parseFloat(filters.minPrice) : priceRange.min
    let max = filters.maxPrice ? parseFloat(filters.maxPrice) : priceRange.max

    // Clamp values to valid range
    min = Math.max(priceRange.min, Math.min(priceRange.max, min))
    max = Math.max(priceRange.min, Math.min(priceRange.max, max))

    // Ensure min <= max
    if (min > max) {
      min = priceRange.min
      max = priceRange.max
    }

    setPriceValues((prevValues) => {
      // Only update if values have actually changed to avoid unnecessary re-renders
      if (prevValues[0] !== min || prevValues[1] !== max) {
        return [min, max]
      }
      return prevValues
    })
  }, [filters.minPrice, filters.maxPrice, priceRange.min, priceRange.max])

  // Update URL with filters
  const updateFilters = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    // Reset to first page when filters change (except when updating page itself)
    if (!updates.page) {
      params.delete("page")
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
    <div>
      {/* Search Query Indicator */}
      {filters.search && (
        <div className=" bg-black text-white flex items-center justify-center p-5 font">
          <p className="text-xl font-bold text-center">
            Search Results for - "{filters.search.toUpperCase()}"
          </p>
        </div>
      )}
      <div className="content-container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-md font-semibold uppercase">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-ui-fg-subtle hover:text-ui-fg-base"
                >
                  Clear All
                </button>
              </div>

              {/* Price Range */}
              <div className="pb-6 border-b border-gray-200">
                <label className="block text-sm font-medium mb-4 text-gray-700">
                  Price
                </label>
                <div className="px-2">
                  <Range
                    values={priceValues}
                    step={1}
                    min={priceRange.min}
                    max={priceRange.max}
                    onChange={(values) => {
                      // Ensure min is always <= max
                      const [min, max] =
                        values[0] <= values[1]
                          ? [values[0], values[1]]
                          : [values[1], values[0]]

                      setPriceValues([min, max])
                      // Always update both min and max prices together
                      updateFilters({
                        min_price: String(min),
                        max_price: String(max),
                      })
                    }}
                    renderTrack={({ props, children }) => (
                      <div
                        {...props}
                        style={{
                          ...props.style,
                          height: "8px",
                          width: "100%",
                          background: getTrackBackground({
                            values: priceValues,
                            colors: ["#e5e7eb", "#000", "#e5e7eb"],
                            min: priceRange.min,
                            max: priceRange.max,
                          }),
                          borderRadius: "0px",
                        }}
                      >
                        {children}
                      </div>
                    )}
                    renderThumb={({ props, index }) => (
                      <div
                        {...props}
                        style={{
                          ...props.style,
                          height: "24px",
                          width: "4px",
                          borderRadius: "0px",
                          backgroundColor: "#000",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          outline: "none",
                        }}
                      />
                    )}
                  />
                  <div className="mt-4 text-sm text-gray-400">
                    Price: ${priceValues[0].toFixed(0)} — $
                    {priceValues[1].toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              {filterOptions?.brands && filterOptions.brands.length > 0 && (
                <div className="pb-6 border-b border-gray-200">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Brand
                  </label>
                  <div className="space-y-2">
                    {filterOptions.brands.map((brand) => (
                      <label key={brand.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.brand.includes(brand.slug)}
                          onChange={() =>
                            handleFilterChange("brand", brand.slug, true)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-400">
                          {brand.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Filter */}
              {filterOptions?.categories &&
                filterOptions.categories.length > 0 && (
                  <div className="pb-6 border-b border-gray-200">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Category
                    </label>
                    <div className="space-y-2">
                      {filterOptions.categories.map((category) => (
                        <label key={category.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.category.includes(category.name)}
                            onChange={() =>
                              handleFilterChange(
                                "category",
                                category.name,
                                true
                              )
                            }
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-400">
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              {/* Gender Filter */}
              {filterOptions?.genders && filterOptions.genders.length > 0 && (
                <div className="pb-6 border-b border-gray-200">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Gender
                  </label>
                  <div className="space-y-2">
                    {filterOptions.genders.map((gender) => (
                      <label key={gender} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.gender.includes(gender)}
                          onChange={() =>
                            handleFilterChange("gender", gender, true)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-400">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Rim Style Filter */}
              {filterOptions?.rim_styles &&
                filterOptions.rim_styles.length > 0 && (
                  <div className="pb-6 border-b border-gray-200">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Rim Style
                    </label>
                    <div className="space-y-2">
                      {filterOptions.rim_styles.map((style) => (
                        <label key={style} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.rimStyle.includes(style)}
                            onChange={() =>
                              handleFilterChange("rim_style", style, true)
                            }
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-400">{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              {/* Shapes Filter */}
              {filterOptions?.shapes && filterOptions.shapes.length > 0 && (
                <div className="pb-6 border-b border-gray-200">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Shapes
                  </label>
                  <div className="space-y-2">
                    {filterOptions.shapes.map((shape) => (
                      <label key={shape} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.shapes.includes(shape)}
                          onChange={() =>
                            handleFilterChange("shapes", shape, true)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-400">{shape}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Filter */}
              {filterOptions?.sizes && filterOptions.sizes.length > 0 && (
                <div className="pb-6 border-b border-gray-200">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Size
                  </label>
                  <div className="space-y-2">
                    {filterOptions.sizes.map((size) => (
                      <label key={size} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.size.includes(size)}
                          onChange={() =>
                            handleFilterChange("size", size, true)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-400">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-ui-fg-subtle">
                  {loading ? "Loading..." : `${count} products found`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Sort by:</label>
                <select
                  value={`${filters.order}_${filters.orderDirection}`}
                  onChange={(e) => {
                    const [order, direction] = e.target.value.split("_")
                    handleSortChange(order, direction)
                  }}
                  className="px-3 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive"
                >
                  <option value="created_at_desc">Newest First</option>
                  <option value="created_at_asc">Oldest First</option>
                  <option value="title_asc">Name A-Z</option>
                  <option value="title_desc">Name Z-A</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
            {/* Products Grid */}
            {error ? (
              <div className="text-center py-12">
                <p className="text-ui-fg-destructive">
                  Error loading products. Please try again.
                </p>
                <button
                  onClick={() => mutate()}
                  className="mt-4 px-4 py-2 bg-ui-bg-interactive text-ui-fg-on-interactive rounded-md hover:bg-ui-bg-interactive-hover"
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <p className="text-ui-fg-subtle">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-ui-fg-subtle">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product: any) => (
                  <ProductPreviewClient
                    key={product.id}
                    product={product}
                    region={region}
                    countryCode={countryCode}
                  />
                ))}
              </div>
            )}
            {/* Pagination */}
            {count > 20 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() =>
                    updateFilters({
                      page: String(Math.max(1, filters.page - 1)),
                    })
                  }
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-ui-border-base rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ui-bg-subtle-hover"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {filters.page} of {Math.ceil(count / 20)}
                </span>
                <button
                  onClick={() =>
                    updateFilters({ page: String(filters.page + 1) })
                  }
                  disabled={filters.page >= Math.ceil(count / 20)}
                  className="px-4 py-2 border border-ui-border-base rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ui-bg-subtle-hover"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
