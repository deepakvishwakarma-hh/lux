"use client"

import { Range, getTrackBackground } from "react-range"

type PriceFilterProps = {
  priceRange: { min: number; max: number }
  priceValues: number[]
  onPriceChange: (min: number, max: number) => void
}

export default function PriceFilter({
  priceRange,
  priceValues,
  onPriceChange,
}: PriceFilterProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const min = Math.max(priceRange.min, Math.min(priceRange.max, parseFloat(e.target.value) || priceRange.min))
    onPriceChange(min, priceValues[1])
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const max = Math.max(priceRange.min, Math.min(priceRange.max, parseFloat(e.target.value) || priceRange.max))
    onPriceChange(priceValues[0], max)
  }

  return (
    <div className="pb-4 sm:pb-6 border-b border-gray-200">
      <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 text-gray-900 uppercase tracking-wide">
        Filter by price
      </h3>
      <div className="space-y-4">
        {/* Min/Max Input Fields */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <label className="block text-xs text-gray-600 mb-1.5">Min price</label>
            <input
              type="number"
              min={priceRange.min}
              max={priceRange.max}
              value={Math.round(priceValues[0])}
              onChange={handleMinChange}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs text-gray-600 mb-1.5">Max price</label>
            <input
              type="number"
              min={priceRange.min}
              max={priceRange.max}
              value={Math.round(priceValues[1])}
              onChange={handleMaxChange}
              className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        {/* Range Slider */}
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

              onPriceChange(min, max)
            }}
            renderTrack={({ props, children }) => {
              const { key, ...restProps } = props as any
              return (
                <div
                  key={key}
                  {...restProps}
                  style={{
                    ...restProps.style,
                    height: "6px",
                    width: "100%",
                    background: getTrackBackground({
                      values: priceValues,
                      colors: ["#e5e7eb", "#000", "#e5e7eb"],
                      min: priceRange.min,
                      max: priceRange.max,
                    }),
                    borderRadius: "3px",
                  }}
                >
                  {children}
                </div>
              )
            }}
            renderThumb={({ props, index }) => {
              const { key, ...restProps } = props as any
              return (
                <div
                  key={key}
                  {...restProps}
                  style={{
                    ...restProps.style,
                    height: "20px",
                    width: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#000",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    outline: "none",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                />
              )
            }}
          />
        </div>

        {/* Price Display */}
        <div className="text-sm font-medium text-gray-700 text-center">
          Price: ${priceValues[0].toFixed(0)} — ${priceValues[1].toFixed(0)}
        </div>
      </div>
    </div>
  )
}

