"use client"

import Slider, { Settings } from "react-slick"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { Carousel } from "@lib/data/carousels"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Link from "next/link"

type CarouselProps = {
  carousels: Carousel[]
}

export default function HomeCarousel({ carousels }: CarouselProps) {
  if (!carousels || carousels.length === 0) {
    return null
  }

  const settings: Settings = {
    dots: true,
    infinite: carousels.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: carousels.length > 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: carousels.length > 1,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: carousels.length > 1,
          dots: true,
          arrows: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: carousels.length > 1,
          dots: true,
          arrows: false,
        },
      },
    ],
  }

  return (
    <div className="w-full relative">
      <style jsx global>{`
        .slick-slider {
          width: 100%;
        }
        .slick-dots {
          bottom: 20px;
        }
        .slick-dots li button:before {
          color: white;
          font-size: 12px;
          opacity: 0.5;
        }
        .slick-dots li.slick-active button:before {
          opacity: 1;
          color: white;
        }
        .slick-prev,
        .slick-next {
          z-index: 1;
          width: 44px;
          height: 44px;
        }
        .slick-prev {
          left: 20px;
        }
        .slick-next {
          right: 20px;
        }
        .slick-prev:before,
        .slick-next:before {
          font-size: 24px;
          color: white;
          opacity: 0.8;
        }
        .slick-prev:hover:before,
        .slick-next:hover:before {
          opacity: 1;
        }
        @media (max-width: 768px) {
          .slick-prev,
          .slick-next {
            display: none !important;
          }
        }
      `}</style>
      {/* @ts-expect-error - react-slick has compatibility issues with React 19 */}
      <Slider {...settings}>
        {carousels.map((carousel) => {
          const imageUrl = carousel.image_url1 || carousel.image_url2
          if (!imageUrl) return null

          const slideContent = (
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] group overflow-hidden">
              <Image
                src={imageUrl}
                alt="Carousel slide"
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="100vw"
              />
            </div>
          )

          return (
            <div key={carousel.id}>
              {carousel.link ? (
                <Link
                  target="_blank"
                  href={carousel.link}
                  className="block w-full"
                  rel="noopener noreferrer"
                >
                  {slideContent}
                </Link>
              ) : (
                slideContent
              )}
            </div>
          )
        })}
      </Slider>
    </div>
  )
}
