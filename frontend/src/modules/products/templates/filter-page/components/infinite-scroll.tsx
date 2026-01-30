"use client"

import { useRef, useEffect, useCallback } from "react"

type InfiniteScrollProps = {
  onLoadMore: () => void
  isLoading: boolean
  hasMore: boolean
  children: React.ReactNode
}

export default function InfiniteScroll({
  onLoadMore,
  isLoading,
  hasMore,
  children,
}: InfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null)
  const hasMoreRef = useRef(hasMore)
  const lastLoadTimeRef = useRef<number>(0)

  // Update refs when props change
  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])

  // Memoize the load more handler to prevent recreating observer
  const handleLoadMore = useCallback(() => {
    // Guard: don't load if already loading, no more items, or called too recently
    const now = Date.now()
    const timeSinceLastLoad = now - lastLoadTimeRef.current
    
    if (isLoading || !hasMoreRef.current || timeSinceLastLoad < 1000) {
      return
    }
    
    // Record load time
    lastLoadTimeRef.current = now
    
    // Call onLoadMore
    onLoadMore()
  }, [onLoadMore, isLoading])

  useEffect(() => {
    const target = observerTarget.current
    // Don't observe if no more items
    if (!target || !hasMore) {
      return
    }

    let observer: IntersectionObserver | null = null

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0]
      // Only trigger if intersecting, not loading, and has more
      if (
        entry.isIntersecting &&
        !isLoading &&
        hasMoreRef.current &&
        hasMore
      ) {
        handleLoadMore()
      }
    }

    observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: "200px", // Start loading 200px before reaching the bottom
    })

    observer.observe(target)

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [handleLoadMore, hasMore, isLoading])

  return (
    <div className="w-full">
      {children}
      {/* Loading indicator - always show at bottom when loading more */}
      {isLoading && (
        <div className="w-full py-12 text-center bg-white border-t border-gray-100" style={{ minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="flex flex-col items-center justify-center gap-3 px-4">
            <div className="relative w-12 h-12">
              <div className="absolute top-0 left-0 w-full h-full border-2 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-700 text-sm font-semibold">Loading more products...</p>
          </div>
        </div>
      )}
      {/* Observer target - only show when not loading and has more */}
      {!isLoading && hasMore && (
        <div ref={observerTarget} className="w-full py-8 text-center" style={{ minHeight: '120px' }}>
          {/* Empty space for observer to detect when scrolling */}
        </div>
      )}
      {/* End message */}
      {!hasMore && !isLoading && (
        <div className="w-full py-8 text-center">
          <p className="text-gray-500 text-sm">No more products to load</p>
        </div>
      )}
    </div>
  )
}
