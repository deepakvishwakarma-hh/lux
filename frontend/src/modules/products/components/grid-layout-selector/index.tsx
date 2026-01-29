"use client"

import { useState, useEffect } from "react"

type GridLayoutSelectorProps = {
  value: "grid-1" | "grid-2" | "grid-3" | "grid-4"
  onChange: (value: "grid-1" | "grid-2" | "grid-3" | "grid-4") => void
  storageKey?: string
}

export default function GridLayoutSelector({
  value,
  onChange,
  storageKey = "product-grid-layout",
}: GridLayoutSelectorProps) {
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(storageKey)
    if (saved && ["grid-1", "grid-2", "grid-3", "grid-4"].includes(saved)) {
      onChange(saved as "grid-1" | "grid-2" | "grid-3" | "grid-4")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  const handleChange = (newValue: "grid-1" | "grid-2" | "grid-3" | "grid-4") => {
    onChange(newValue)
    if (mounted) {
      localStorage.setItem(storageKey, newValue)
    }
  }

  const layouts = [
    { value: "grid-1" as const, icon: Grid1Icon, label: "1 column" },
    { value: "grid-2" as const, icon: Grid2Icon, label: "2 columns" },
    { value: "grid-3" as const, icon: Grid3Icon, label: "3 columns" },
    { value: "grid-4" as const, icon: Grid4Icon, label: "4 columns" },
  ]

  return (
    <div className="hidden lg:flex items-center gap-1 border border-gray-300 rounded-md bg-white p-1">
      {layouts.map((layout) => {
        const Icon = layout.icon
        const isActive = value === layout.value
        return (
          <button
            key={layout.value}
            onClick={() => handleChange(layout.value)}
            className={`p-2 rounded transition-colors ${
              isActive
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-label={layout.label}
            title={layout.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}

// Grid Icon Components
function Grid1Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="18" rx="1" strokeWidth="2" />
    </svg>
  )
}

function Grid2Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="9" height="18" rx="1" strokeWidth="2" />
      <rect x="12" y="3" width="9" height="18" rx="1" strokeWidth="2" />
    </svg>
  )
}

function Grid3Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="5" height="18" rx="1" strokeWidth="2" />
      <rect x="9.5" y="3" width="5" height="18" rx="1" strokeWidth="2" />
      <rect x="16" y="3" width="5" height="18" rx="1" strokeWidth="2" />
    </svg>
  )
}

function Grid4Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="4" height="18" rx="1" strokeWidth="2" />
      <rect x="8.5" y="3" width="4" height="18" rx="1" strokeWidth="2" />
      <rect x="14" y="3" width="4" height="18" rx="1" strokeWidth="2" />
      <rect x="19.5" y="3" width="4" height="18" rx="1" strokeWidth="2" />
    </svg>
  )
}
