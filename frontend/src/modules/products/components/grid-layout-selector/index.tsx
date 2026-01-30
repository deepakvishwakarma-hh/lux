"use client"

import { useState, useEffect } from "react"
import { TfiLayoutGrid4, TfiLayoutGrid3, TfiLayoutGrid2, TfiAlignJustify } from "react-icons/tfi";

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
    { value: "grid-1" as const, icon: TfiAlignJustify, label: "1 column" },
    { value: "grid-2" as const, icon: TfiLayoutGrid2, label: "2 columns" },
    { value: "grid-3" as const, icon: TfiLayoutGrid3, label: "3 columns" },
    { value: "grid-4" as const, icon: TfiLayoutGrid4, label: "4 columns" },
  ]

  return (
    <div className="hidden lg:flex items-center gap-1  p-1">
      {layouts.map((layout) => {
        const Icon = layout.icon
        const isActive = value === layout.value
        return (
          <button
            key={layout.value}
            onClick={() => handleChange(layout.value)}
            className={`p-2 rounded transition-colors ${isActive
              ? "opacity-100"
              : "opacity-30 hover:opacity-100"
              }`}
            aria-label={layout.label}
            title={layout.label}
          >
            <Icon className="w-5 h-5" />
          </button>
        )
      })}
    </div>
  )
}
