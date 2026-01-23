"use client"

import React from "react"
// import { Button } from "@medusajs/ui"
import { ProductAvailabilityResponse } from "@lib/data/products"

type AvailabilityStatusProps = {
  availability: ProductAvailabilityResponse | null
  regionAvailable: boolean
  isInStock: boolean
  productId: string
  productTitle: string
}

const AvailabilityStatus = ({
  availability,
  regionAvailable,
  isInStock,
  productId,
  productTitle,
}: AvailabilityStatusProps) => {
  // Determine availability status
  const getAvailabilityStatus = () => {
    // First check: Is product available in this region?
    if (!regionAvailable) {
      return {
        text: "Not Available in Your Region",
        color: "text-red-700",
        bg: "bg-red-50",
        dot: "bg-red-500",
      }
    }

    // Second check: Stock status (only if available in region)
    if (isInStock) {
      return {
        text: "In Stock",
        color: "text-green-700",
        bg: "bg-green-50",
        dot: "bg-green-500",
      }
    }

    // Out of stock (but available in region)
    return {
      text: "Out of Stock",
      color: "text-red-700",
      bg: "bg-red-50",
      dot: "bg-red-500",
    }
  }

  const availabilityStatus = getAvailabilityStatus()

  // const handleAskQuestion = () => {
  //   // Button click handler - functionality to be implemented later
  //   console.log("Ask Question clicked for product:", productId)
  // }

  // const handleRestockNotification = () => {
  //   // Button click handler - functionality to be implemented later
  //   console.log("Set Restock Notification clicked for product:", productId)
  // }

  return (
    <div
      className={`flex items-center justify-between gap-3 p-4 rounded-lg border ${availabilityStatus.bg} border-gray-200`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 ${availabilityStatus.dot}`}
          aria-hidden="true"
        />
        <span className={`text-sm font-semibold ${availabilityStatus.color}`}>
          {availabilityStatus.text}
        </span>
      </div>

      {/* Action Buttons */}
      {/* {!regionAvailable && (
        <Button
          variant="transparent"
          onClick={handleAskQuestion}
          className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 underline font-medium whitespace-nowrap"
        >
          Ask Question
        </Button>
      )}

      {regionAvailable && !isInStock && (
        <Button
          variant="transparent"
          onClick={handleRestockNotification}
          className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 underline font-medium whitespace-nowrap"
        >
          Set Restock Notification
        </Button>
      )} */}
    </div>
  )
}

export default AvailabilityStatus
