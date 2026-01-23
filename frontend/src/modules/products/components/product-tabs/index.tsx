"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"
import RecentlyViewedProducts from "../recently-viewed-products"
import { Brand } from "@lib/data/brands"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
  region: HttpTypes.StoreRegion
  visibleFields?: string[]
  brand?: Brand | null
}

type ProductTabProps = {
  product: HttpTypes.StoreProduct
  visibleFields?: string[]
  brand?: Brand | null
}

const ProductTabs = ({
  product,
  countryCode,
  region,
  visibleFields,
  brand,
}: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product Details",
      component: (
        <ProductInfoTab
          product={product}
          visibleFields={visibleFields}
          brand={brand}
        />
      ),
    },

    {
      label: "Product Description",
      component: <ProductDescriptionTab product={product} />,
    },
    {
      label: "Recently Viewed Products",
      component: (
        <RecentlyViewedProducts
          currentProductId={product.id}
          countryCode={countryCode}
        />
      ),
    },
  ]

  return (
    <div className="w-full mt-6 border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product, visibleFields, brand }: ProductTabProps) => {
  const formatKey = (key: string): string => {
    const raw = key.includes(".") ? key.split(".").slice(-1)[0] : key
    return raw
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "-"
    if (typeof value === "boolean") return value ? "Yes" : "No"
    if (Array.isArray(value)) return value.join(", ")
    if (typeof value === "object") return JSON.stringify(value, null, 2)
    return String(value)
  }

  const resolveKey = (obj: any, key: string, brand?: Brand | null) => {
    // if brand field requested, prefer provided brand prop, then product.brand fallback
    if (key === "brand") {
      if (brand && brand.name) return brand.name
      if (Object.prototype.hasOwnProperty.call(obj, "brand")) {
        const prodBrand = obj["brand"]
        if (prodBrand && typeof prodBrand === "object")
          return prodBrand.name || prodBrand
        return prodBrand
      }
    }

    // support nested keys with dot notation
    if (key.includes(".")) {
      return key.split(".").reduce((acc: any, part: string) => {
        if (acc === undefined || acc === null) return undefined
        return acc[part]
      }, obj)
    }

    // direct property on product
    if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key]

    // fallback to metadata
    if (obj.metadata && Object.prototype.hasOwnProperty.call(obj.metadata, key))
      return obj.metadata[key]

    return undefined
  }

  // If visibleFields provided, render only those. Otherwise fall back to showing all metadata entries.
  const fieldsToRender =
    visibleFields && visibleFields.length > 0
      ? visibleFields
          .map((k) => ({
            key: formatKey(k),
            value: formatValue(resolveKey(product, k, brand)),
          }))
          .filter((field) => field.value && field.value !== "-")
      : product.metadata
      ? Object.entries(product.metadata)
          .map(([key, value]) => ({
            key: formatKey(key),
            value: formatValue(value),
          }))
          .filter((field) => field.value && field.value !== "-")
      : []

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-col divide-y divide-gray-100">
        {fieldsToRender.length > 0 ? (
          fieldsToRender.map((field, index) => (
            <div 
              key={index} 
              className="flex flex-col sm:flex-row gap-2 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <span className="font-semibold text-gray-700 min-w-[40%] sm:min-w-[35%] text-sm sm:text-base font-urbanist">
                {field.key}
              </span>
              <span className="text-gray-900 sm:border-l sm:border-gray-200 sm:pl-4 sm:ml-4 text-sm sm:text-base leading-relaxed">
                {field.value}
              </span>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 text-sm">
            No details available
          </div>
        )}
      </div>
    </div>
  )
}
const ProductDescriptionTab = ({ product }: ProductTabProps) => {
  return (
    <div className="text-sm sm:text-base text-gray-700 py-6 px-2 leading-relaxed">
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap">{product.description}</p>
      </div>
    </div>
  )
}

export default ProductTabs
