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
  showViewSelector?: boolean
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
  showViewSelector = true,
}: SortControlsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 pb-4 border-b border-gray-200">
      <div>
        <p className="text-sm text-ui-fg-subtle text-center sm:text-left">
          {isLoading ? "Loading..." : `${count} products found`}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
        {onOpenFilters && (
          <button
            onClick={onOpenFilters}
            className="inline-flex items-center gap-2 p-2 rounded-md text-gray-700 hover:bg-gray-100 lg:hidden flex-shrink-0"
            aria-label="Open filters"
            aria-haspopup="dialog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-sm font-medium">Filters</span>
          </button>
        )}

        <label className="text-sm font-medium hidden sm:inline">Sort by:</label>

        <select
          value={`${order}_${orderDirection}`}
          onChange={(e) => {
            const [newOrder, newDirection] = e.target.value.split("_")
            onSortChange(newOrder, newDirection)
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-auto flex-1 sm:flex-none min-w-0"
        >
          <option value="created_at_desc">Newest First</option>
          <option value="title_asc">Name A-Z</option>
          <option value="title_desc">Name Z-A</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

        {showViewSelector !== false && (
          <select
            value={viewMode}
            onChange={(e) => onViewModeChange?.(e.target.value as 'list' | 'grid-2' | 'grid-3' | 'grid-4')}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-40 mt-2 sm:mt-0 sm:ml-2"
            aria-label="View mode"
          >
            <option value="list">View - List</option>
            <option value="grid-2">View - Grid 2</option>
            <option value="grid-3">View - Grid 3</option>
            <option value="grid-4">View - Grid 4</option>
          </select>
        )}
      </div>
    </div>
  )
}

