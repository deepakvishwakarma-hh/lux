"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product Details",
      component: <ProductInfoTab product={product} />,
    },

    {
      label: "Product Description",
      component: <ProductDescriptionTab product={product} />,
    },
  ]

  return (
    <div className="w-full mt-3">
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

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  // Helper function to format metadata keys (snake_case to Title Case)
  const formatKey = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  // Helper function to format metadata values
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "-"
    if (typeof value === "boolean") return value ? "Yes" : "No"
    if (Array.isArray(value)) return value.join(", ")
    if (typeof value === "object") return JSON.stringify(value, null, 2)
    return String(value)
  }

  // Get all metadata entries
  const metadataEntries = product.metadata
    ? Object.entries(product.metadata).map(([key, value]) => ({
        key: formatKey(key),
        value: formatValue(value),
      }))
    : []

  // Combine standard fields and metadata
  const allFields = [...metadataEntries]

  return (
    <div className="text-small-regular border-x border-t">
      <div className="flex flex-col">
        {allFields.map((field, index) => (
          <div key={index} className="flex flex-row gap-4 even:border-y">
            <span className="font-semibold min-w-[50%] p-2">{field.key}</span>
            <span className="text-ui-fg-base border-l p-2">{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
const ProductDescriptionTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-sm text-gray-700 py-8">
      <p>{product.description}</p>
    </div>
  )
}

export default ProductTabs
