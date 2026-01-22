"use client"

import Image from "next/image"
import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/pagination"

interface ProductImageCarouselProps {
  images: string[]
  productTitle: string
  productHandle?: string
  ean?: string
}

export default function ProductImageCarousel({
  images,
  productTitle,
  productHandle,
  ean,
}: ProductImageCarouselProps) {
  const [activeImage, setActiveImage] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-white rounded" />
    )
  }

  // Generate SEO-optimized alt text
  const getImageAlt = (index: number): string => {
    if (index === 0) {
      // First image: use product slug (handle)
      return productHandle || productTitle
    } else {
      // Subsequent images: use EAN with image number
      const imageNumber = index + 1
      return ean ? `${ean} image #${imageNumber}` : `${productTitle} image #${imageNumber}`
    }
  }

  // Generate aria-describedby ID for each image
  const getImageDescribedBy = (index: number): string => {
    return `product-image-desc-${index}`
  }

  return (
    <div className="w-full">
      {/* Hidden description elements for aria-describedby */}
      <div className="sr-only">
        {images.map((_, index) => (
          <div key={index} id={getImageDescribedBy(index)}>
            {getImageAlt(index)}
          </div>
        ))}
      </div>
      {/* ================= MOBILE SLIDER ================= */}
      <div className="block md:hidden relative aspect-square bg-white rounded">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          onSlideChange={(s) => setActiveImage(s.activeIndex)}
        >
          {images.map((img, i) => (
            <SwiperSlide key={i}>
              <div className="relative aspect-square">
                <Image
                  src={img}
                  alt={getImageAlt(i)}
                  fill
                  className="object-contain"
                  priority={i === 0}
                  aria-describedby={getImageDescribedBy(i)}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden md:grid grid-cols-[80px_1fr] gap-6">
        {/* Thumbnails */}
        <div className="flex flex-col gap-4">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              onMouseEnter={() => setActiveImage(index)}
              onFocus={() => setActiveImage(index)}
              className={`relative aspect-square border rounded-md overflow-hidden ${activeImage === index ? "border-black" : "border-gray-200"
                }`}
            >
              <Image
                src={img}
                alt={getImageAlt(index)}
                fill
                className="object-contain"
                aria-describedby={getImageDescribedBy(index)}
              />
            </button>
          ))}
        </div>


        {/* Main Image */}
        <div className="relative aspect-square bg-white rounded overflow-hidden">
          <Image
            src={images[activeImage]}
            alt={getImageAlt(activeImage)}
            fill
            className="object-contain"
            priority
            aria-describedby={getImageDescribedBy(activeImage)}
          />
        </div>
      </div>
    </div>
  )
}
