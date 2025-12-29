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

  useEffect(() => {
    if (hasSelectedValues) {
      setIsOpen(true)
    }
  }, [hasSelectedValues])

  return (
    <div className="border-b border-gray-200">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="
          w-full flex items-center justify-between
          py-3 sm:py-4
          px-2 sm:px-3
          text-left
          hover:bg-gray-50
          active:bg-gray-100
          transition-colors
          rounded-md
        "
      >
        <h3
          className="
            text-sm sm:text-base
            font-semibold
            text-gray-900
            uppercase
            tracking-wide
            truncate
          "
        >
          {label}
        </h3>

        {/* Chevron */}
        <svg
          className={`
            w-5 h-5 sm:w-5 sm:h-5
            text-gray-600
            transition-transform duration-200
            flex-shrink-0
            ${isOpen ? "rotate-180" : ""}
          `}
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

      {/* Content */}
      <div
        className={`
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="pt-2 pb-4 px-1 sm:px-2">
          {children}
        </div>
      </div>
    </div>
  )
}
