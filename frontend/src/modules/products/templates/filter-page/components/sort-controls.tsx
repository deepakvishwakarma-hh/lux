"use client"

type SortControlsProps = {
  count: number
  isLoading: boolean
  order: string
  orderDirection: string
  viewMode?: 'list' | 'grid-2' | 'grid-3' | 'grid-4'
  onSortChange: (order: string, direction: string) => void
  onViewModeChange?: (mode: 'list' | 'grid-2' | 'grid-3' | 'grid-4') => void
  onOpenFilters?: () => void
}

export default function SortControls({
  count,
  isLoading,
  order,
  orderDirection,
  viewMode = 'grid-3',
  onSortChange,
  onViewModeChange,
  onOpenFilters,
}: SortControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 border-b border-gray-200">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-700">
          {isLoading ? (
            <span className="text-gray-500">Loading...</span>
          ) : (
            <span>
              Showing <span className="font-semibold text-gray-900">{count}</span> products
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3 w-full">
        {/* Mobile filters button - appears inline with sort controls */}
        {onOpenFilters && (
          <button
            onClick={onOpenFilters}
            className="lg:hidden p-2 bg-white rounded-md shadow text-gray-900"
            aria-label="Open filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-2">
            <span className="text-xs sm:hidden font-semibold text-gray-900">Sort</span>
            <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-gray-900">Sort by:</span>
          </label>
          <select
            value={`${order}_${orderDirection}`}
            onChange={(e) => {
              const [newOrder, newDirection] = e.target.value.split("_")
              onSortChange(newOrder, newDirection)
            }}
            className="w-28 sm:w-44 px-2 sm:px-4 py-2 text-xs sm:py-2.5 sm:text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer"
          >
            <option value="created_at_desc">Newest First</option>
            <option value="title_asc">Name A-Z</option>
            <option value="title_desc">Name Z-A</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* View Mode Dropdown */}
          <select
            value={viewMode}
            onChange={(e) => onViewModeChange?.(e.target.value as 'list' | 'grid-2' | 'grid-3' | 'grid-4')}
            className="w-32 sm:w-40 px-2 sm:px-4 py-2 text-xs sm:py-2.5 sm:text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer"
            aria-label="View mode"
          >
            <option value="list">View - List</option>
            <option value="grid-2">View - Grid 2</option>
            <option value="grid-3">View - Grid 3</option>
            <option value="grid-4">View - Grid 4</option>
          </select>
        </div>
      </div>
    </div>
  )
}

