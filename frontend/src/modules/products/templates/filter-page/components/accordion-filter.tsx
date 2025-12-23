"use client"

import { useState, useEffect, ReactNode } from "react"

type AccordionFilterProps = {
  label: string
  children: ReactNode
  isOpenByDefault?: boolean
  hasSelectedValues?: boolean
}

export default function AccordionFilter({
  label,
  children,
  isOpenByDefault = false,
  hasSelectedValues = false,
}: AccordionFilterProps) {
  const [isOpen, setIsOpen] = useState(isOpenByDefault || hasSelectedValues)

  // Auto-open if values are selected
  useEffect(() => {
    if (hasSelectedValues) {
      setIsOpen(true)
    }
  }, [hasSelectedValues])

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors rounded-md px-1 -mx-1"
      >
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          {label}
        </h3>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pb-4 pt-2">{children}</div>
      </div>
    </div>
  )
}

