"use client"

type SearchQueryIndicatorProps = {
  searchQuery: string
}

export default function SearchQueryIndicator({
  searchQuery,
}: SearchQueryIndicatorProps) {
  if (!searchQuery) return null

  return (
    <div className="bg-gray-900 text-white flex items-center justify-center py-6 px-4">
      <p className="text-lg md:text-xl font-semibold text-center tracking-wide">
        Search Results for: <span className="font-bold">"{searchQuery}"</span>
      </p>
    </div>
  )
}

