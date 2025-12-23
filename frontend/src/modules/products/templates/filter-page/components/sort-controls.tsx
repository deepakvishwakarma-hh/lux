"use client"

type SortControlsProps = {
  count: number
  isLoading: boolean
  order: string
  orderDirection: string
  onSortChange: (order: string, direction: string) => void
}

export default function SortControls({
  count,
  isLoading,
  order,
  orderDirection,
  onSortChange,
}: SortControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
      <div>
        <p className="text-sm font-medium text-gray-700">
          {isLoading ? (
            <span className="text-gray-500">Loading...</span>
          ) : (
            <span>
              Showing <span className="font-semibold text-gray-900">{count}</span> products
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-gray-900">Sort by:</label>
        <select
          value={`${order}_${orderDirection}`}
          onChange={(e) => {
            const [newOrder, newDirection] = e.target.value.split("_")
            onSortChange(newOrder, newDirection)
          }}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer min-w-[180px]"
        >
          <option value="created_at_desc">Newest First</option>
          <option value="title_asc">Name A-Z</option>
          <option value="title_desc">Name Z-A</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  )
}

