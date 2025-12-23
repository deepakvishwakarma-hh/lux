"use client"

import Image from "next/image"
import { useState, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperType } from "swiper"
import { Thumbs } from "swiper/modules"
import Lightbox from "yet-another-react-lightbox"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Slideshow from "yet-another-react-lightbox/plugins/slideshow"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import Captions from "yet-another-react-lightbox/plugins/captions"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"

import "swiper/css"
import "swiper/css/thumbs"
import { BsArrowsFullscreen } from "react-icons/bs"

interface ProductImageCarouselProps {
  images: string[]
  productTitle: string
}

const ProductImageCarousel = ({
  images,
  productTitle,
}: ProductImageCarouselProps) => {
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const swiperRef = useRef<SwiperType | null>(null)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full">
        <div className="relative aspect-square w-full rounded bg-white">
          <Image
            src="/placeholder.svg"
            alt={`${productTitle} - No image available`}
            fill
            className="object-contain w-full h-full"
            priority
          />
        </div>
      </div>
    )
  }

  // Prepare slides for Lightbox
  const lightboxSlides = images.map((img, idx) => ({
    src: img,
    alt: `${productTitle} - View ${idx + 1}`,
  }))

  return (
    <div className="grid grid-cols-[100px_calc(100%-100px)] gap-4">
      <div className="">
        {/* Thumbnail Carousel */}
        {images.length > 1 && (
          <div className="w-full mt-3">
            <div
              className="flex flex-col gap-2 overflow-y-auto"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden`}
                  style={{
                    width: "100px",
                    height: "100px",
                    border:
                      activeImage === index
                        ? "2px solid #d4af37"
                        : "2px solid transparent",
                  }}
                  onClick={() => {
                    if (swiperRef.current) {
                      swiperRef.current.slideTo(index)
                      setActiveImage(index)
                    }
                  }}
                >
                  <Image
                    src={image}
                    alt={`${productTitle} - View ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Image Carousel */}
      <div className="relative aspect-square w-full rounded bg-white mb-3">
        <Swiper
          spaceBetween={0}
          pagination={{
            clickable: true,
            type: "bullets",
          }}
          modules={[Thumbs]}
          className="h-full product-image-carousel"
          onSlideChange={(swiper) => setActiveImage(swiper.activeIndex)}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <Image
                  src={image}
                  alt={`${productTitle} - View ${index + 1}`}
                  fill
                  className="object-contain w-full h-full"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Floating enlarge button */}
        <button
          className="absolute top-2.5 left-2.5 z-30 w-10 h-10 flex items-center justify-center text-black rounded-full border-2 border-black bg-transparent focus:outline-none"
          type="button"
          aria-label="Click to enlarge"
          onClick={() => setLightboxOpen(true)}
          tabIndex={0}
        >
          <BsArrowsFullscreen />
        </button>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={activeImage}
        plugins={[Fullscreen, Slideshow, Thumbnails, Zoom, Captions]}
        on={{
          view: ({ index }) => setActiveImage(index),
        }}
        render={
          {
            // Optionally, you can customize the slide rendering here
          }
        }
      />
    </div>
  )
}

export default ProductImageCarousel
