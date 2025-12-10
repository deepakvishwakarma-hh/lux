"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation } from "swiper/modules"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { Carousel } from "@lib/data/carousels"

import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

type HeroCarouselProps = {
  carousels: Carousel[]
}

export default function HeroCarousel({ carousels }: HeroCarouselProps) {
  if (!carousels || carousels.length === 0) {
    return null
  }

  return (
    <div className="w-full relative">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        loop={carousels.length > 1}
        className="hero-carousel"
      >
        {carousels.map((carousel) => {
          const imageUrl = carousel.image_url1 || carousel.image_url2
          if (!imageUrl) return null

          const slideContent = (
            <div className="relative w-full h-[500px] md:h-[600px]">
              <Image
                src={imageUrl}
                alt="Carousel slide"
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )

          return (
            <SwiperSlide key={carousel.id}>
              {carousel.link ? (
                <LocalizedClientLink
                  href={carousel.link}
                  className="block w-full"
                >
                  {slideContent}
                </LocalizedClientLink>
              ) : (
                slideContent
              )}
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
