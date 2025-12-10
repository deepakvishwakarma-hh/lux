"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, FormEvent } from "react"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"

export default function NavSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/store?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleClear = () => {
    setQuery("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 w-full">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products"
          className="w-full h-[46px] pl-4 pr-20 bg-gray-100 border border-[#8d8d8d] rounded-md text-[#8d8d8d] placeholder:text-[#8d8d8d] focus:outline-none focus:ring-1 focus:ring-[#8d8d8d] focus:border-[#8d8d8d] text-sm bg-[#f1f1f180]"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-4">
          {query && (
            <>
              <button
                type="button"
                onClick={handleClear}
                className="pointer-events-auto cursor-pointer hover:opacity-70 transition-opacity"
                aria-label="Clear search"
              >
                <WoodMartIcon
                  iconContent="f112"
                  size={14}
                  className="text-gray-400"
                />
              </button>
              <div className="h-4 w-px bg-gray-400"></div>
            </>
          )}
          <div className="pointer-events-none">
            <WoodMartIcon
              iconContent="f130"
              size={18}
              className="text-gray-400"
            />
          </div>
        </div>
      </div>
    </form>
  )
}
