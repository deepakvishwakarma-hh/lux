"use client"

type SearchQueryIndicatorProps = {
  searchQuery: string
}

export default function SearchQueryIndicator({
  searchQuery,
}: SearchQueryIndicatorProps) {
  if (!searchQuery) return null

  return (
    <div className="bg-gray-900 text-white flex items-center justify-center py-4 sm:py-6 px-3 sm:px-4">
      <p className="text-sm sm:text-base md:text-lg font-semibold text-center tracking-wide break-words">
        Search Results for: <span className="font-bold">"{searchQuery}"</span>
      </p>
    </div>
  )
}

