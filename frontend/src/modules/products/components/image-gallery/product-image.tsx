"use client"

import Image from "next/image"
import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import Lightbox from "yet-another-react-lightbox"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Zoom from "yet-another-react-lightbox/plugins/zoom"

import "swiper/css"
import "swiper/css/pagination"
import "yet-another-react-lightbox/styles.css"

import { BsArrowsFullscreen } from "react-icons/bs"

interface ProductImageCarouselProps {
  images: string[]
  productTitle: string
}

export default function ProductImageCarousel({
  images,
  productTitle,
}: ProductImageCarouselProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-white rounded" />
    )
  }

  const lightboxSlides = images.map((img) => ({ src: img }))

  return (
    <div className="w-full">
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
                  alt={`${productTitle} ${i}`}
                  fill
                  className="object-contain"
                  priority={i === 0}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className="absolute top-2 left-2 z-20 w-9 h-9 rounded-full border-2 border-black bg-white flex items-center justify-center"
          onClick={() => setLightboxOpen(true)}
        >
          <BsArrowsFullscreen />
        </button>
      </div>

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden md:grid grid-cols-[80px_1fr] gap-6">
        {/* Thumbnails */}
        <div className="flex flex-col gap-4">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`relative aspect-square border rounded-md overflow-hidden ${
                activeImage === index
                  ? "border-black"
                  : "border-gray-200"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index}`}
                fill
                className="object-contain"
              />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div className="relative aspect-square bg-white rounded">
          <Image
            src={images[activeImage]}
            alt={productTitle}
            fill
            className="object-contain"
            priority
          />

          <button
            className="absolute top-3 left-3 z-20 w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center"
            onClick={() => setLightboxOpen(true)}
          >
            <BsArrowsFullscreen />
          </button>
        </div>
      </div>

      {/* ================= LIGHTBOX ================= */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={activeImage}
        plugins={[Fullscreen, Zoom]}
        on={{ view: ({ index }) => setActiveImage(index) }}
      />
    </div>
  )
}
