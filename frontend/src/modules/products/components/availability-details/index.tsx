"use client"

import {
  calculateDeliveryDateRange,
  formatDeliveryDate,
} from "@lib/util/calculate-delivery-date"
import { FaTruck } from "react-icons/fa"
type AvailabilityDetailsProps = {
  eta: string | null
}

const AvailabilityDetails = ({ eta }: AvailabilityDetailsProps) => {
  if (!eta) {
    return null
  }

  const deliveryRange = calculateDeliveryDateRange(eta)

  if (!deliveryRange) {
    return null
  }

  const { minDate, maxDate } = deliveryRange
  const isRange = minDate.getTime() !== maxDate.getTime()

  return (
    <div className="flex items-start gap-3 p-4 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
      {/* Delivery Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <FaTruck />
      </div>

      {/* Delivery Information */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-ui-fg-base mb-1">
          {isRange ? (
            <>Expected delivery: {formatDeliveryDate(maxDate)}</>
          ) : (
            <>Want it by {formatDeliveryDate(minDate)}?</>
          )}
        </p>
        <p className="text-xs text-ui-fg-subtle">
          {isRange
            ? `Estimated delivery within ${eta} (excluding weekends and holidays)`
            : `Order now for delivery by ${formatDeliveryDate(minDate)}`}
        </p>
      </div>
    </div>
  )
}

export default AvailabilityDetails
