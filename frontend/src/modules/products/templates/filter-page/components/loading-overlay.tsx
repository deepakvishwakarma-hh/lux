"use client"

type LoadingOverlayProps = {
  isLoading: boolean
}

export default function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-base sm:text-lg font-medium text-gray-700 text-center">Loading products...</p>
      </div>
    </div>
  )
}

