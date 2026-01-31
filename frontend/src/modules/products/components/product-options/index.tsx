"use client"

import Link from "next/link"
import Image from "next/image"
import React, { useMemo } from "react"
import { useParams } from "next/navigation"

interface ProductOption {
    id: string
    size: string
    color: string
    handle: string
    thumbnail: string
}

interface ProductOptionsProps {
    options: ProductOption[]
    activeProductId: string
}

const ProductOptions = ({ options, activeProductId }: ProductOptionsProps) => {
    const params = useParams()
    const countryCode = params.countryCode as string

    // Get active product info by id
    const activeProduct = useMemo(() => {
        const found = options.find((o) => o.id === activeProductId)
        return found || options[0]
    }, [activeProductId, options])

    // Unique sizes, preserve order
    const sizes = useMemo(() => {
        const seen = new Set<string>()
        return options
            .map((opt) => opt.size)
            .filter((size) => {
                if (!seen.has(size)) {
                    seen.add(size)
                    return true
                }
                return false
            })
    }, [options])

    // Unique colors with their thumbnails, preserve order (Amazon-style: show ALL colors)
    const uniqueColors = useMemo(() => {
        const colorMap = new Map<string, ProductOption>()
        options.forEach((opt) => {
            if (!colorMap.has(opt.color)) {
                colorMap.set(opt.color, opt)
            }
        })
        return Array.from(colorMap.values())
    }, [options])

    // Check if a size is available for the active color
    const isSizeAvailableForActiveColor = (size: string) => {
        return options.some(
            (opt) => opt.size === size && opt.color === activeProduct.color
        )
    }

    // Check if a color is available for the active size
    const isColorAvailableForActiveSize = (color: string) => {
        return options.some(
            (opt) => opt.size === activeProduct.size && opt.color === color
        )
    }

    // Get href for size - Amazon-style: try same color first, then first available
    const getSizeHref = (size: string) => {
        if (size === activeProduct.size) return null // Already on this size

        // Try to find product with same color as active product
        const sameColorProduct = options.find(
            (opt) => opt.size === size && opt.color === activeProduct.color
        )

        // If found, use it; otherwise use first product with that size
        const targetProduct = sameColorProduct || options.find((opt) => opt.size === size)

        return targetProduct ? `/${countryCode}/products/${targetProduct.handle}` : null
    }

    // Get href for color - Amazon-style: try same size first, then first available
    const getColorHref = (color: string) => {
        if (color === activeProduct.color) return null // Already on this color

        // Try to find product with same size as active product
        const sameSizeProduct = options.find(
            (opt) => opt.size === activeProduct.size && opt.color === color
        )

        // If found, use it; otherwise use first product with that color
        const targetProduct = sameSizeProduct || options.find((opt) => opt.color === color)

        return targetProduct ? `/${countryCode}/products/${targetProduct.handle}` : null
    }

    if (!activeProduct || sizes.length === 0) {
        return null
    }

    return (
        <div className="space-y-6 py-4 border-t border-gray-200">

            {/* Color Selection - Amazon-style: Show ALL colors */}
            {uniqueColors.length > 0 && (
                <div className="flex flex-col gap-y-3">
                    <span className="text-sm font-medium text-gray-500 uppercase">
                        Select Colors
                    </span>
                    <div className="flex flex-wrap gap-3">
                        {uniqueColors.map((opt) => {
                            const isActive = opt.color === activeProduct.color
                            const isAvailable = isColorAvailableForActiveSize(opt.color)
                            const href = getColorHref(opt.color)

                            // Amazon-style: Show all colors, but indicate availability
                            const className = `relative group transition-all rounded-lg overflow-hidden ${isActive
                                ? "ring-2 ring-black ring-offset-2"
                                : isAvailable
                                    ? "border border-gray-300 hover:border-gray-400 hover:shadow-md"
                                    : "border border-gray-200 opacity-60 hover:opacity-80"
                                }`

                            const content = (
                                <>
                                    <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-gray-50 ${!isAvailable && !isActive ? "opacity-5  0" : ""
                                        }`}>
                                        <Image
                                            src={opt.thumbnail}
                                            alt={opt.color}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 640px) 64px, 80px"
                                        />
                                    </div>
                                    {!isAvailable && !isActive && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <p className="text-xs black text-center">Not available in this size</p>
                                        </div>
                                    )}
                                </>
                            )

                            if (isActive || !href) {
                                return (
                                    <div
                                        key={opt.color}
                                        className={className}
                                        title={`${opt.color}${!isAvailable && !isActive ? " (not available in this size)" : ""}`}
                                    >
                                        {content}
                                    </div>
                                )
                            }

                            return (
                                <Link
                                    key={opt.color}
                                    href={href}
                                    className={className}
                                    title={`${opt.color}${!isAvailable ? " (will change size)" : ""}`}
                                >
                                    {content}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Size Selection - Amazon-style: Show ALL sizes with availability indication */}
            <div className="flex flex-col gap-y-3">
                <span className="text-sm font-medium text-gray-500 uppercase">
                    Select Size
                </span>
                <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                        const isActive = size === activeProduct.size
                        const isAvailable = isSizeAvailableForActiveColor(size)
                        const href = getSizeHref(size)

                        // Amazon-style: Show all sizes, but indicate availability
                        const className = `border text-sm font-medium h-10 rounded-full px-5 transition-all flex items-center justify-center ${isActive
                            ? "border-black bg-white text-black shadow-sm"
                            : isAvailable
                                ? "border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100 hover:shadow-sm"
                                : "border-gray-200 bg-gray-50 text-gray-400 opacity-60 hover:opacity-80"
                            }`

                        if (isActive || !href) {
                            return (
                                <span
                                    key={size}
                                    className={className}
                                    title={!isAvailable && !isActive ? `${size} (not available in this color)` : size}
                                >
                                    {size}
                                </span>
                            )
                        }

                        return (
                            <Link
                                key={size}
                                href={href}
                                className={className}
                                title={!isAvailable ? `${size} (will change color)` : size}
                            >
                                {size}
                            </Link>
                        )
                    })}
                </div>
            </div>

        </div>
    )
}

export default ProductOptions