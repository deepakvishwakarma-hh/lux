"use client"

import { useState, useEffect } from "react"
import { Text } from "@medusajs/ui"
import type { Review } from "@lib/data/reviews"
import CreateReviewForm from "../create-review-form"
import { useSession } from "@lib/hooks/use-session"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

type ProductReviewsProps = {
  productId: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            star <= rating
              ? "text-yellow-400 fill-current"
              : "text-gray-300 fill-current"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewItem({ review }: { review: Review }) {
  const date = new Date(review.created_at)
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="h-full p-4 sm:p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200">
      <div className="flex flex-col h-full">
        {/* Header: Name and Date */}
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">
                  {review.first_name?.[0] || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <Text className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {review.first_name} {review.last_name}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {formattedDate}
                </Text>
              </div>
            </div>
            <div className="ml-10 sm:ml-12">
              <StarRating rating={review.rating} />
            </div>
          </div>
        </div>
        
        {/* Review Title */}
        {review.title && (
          <Text className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {review.title}
          </Text>
        )}
        
        {/* Review Content */}
        <Text className="text-sm sm:text-base text-gray-700 leading-relaxed flex-1 line-clamp-5">
          {review.content}
        </Text>
      </div>
    </div>
  )
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { customer, isLoading: sessionLoading } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [isCheckingReview, setIsCheckingReview] = useState(false)

  const fetchReviews = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch reviews")
      }

      const data = await response.json()
      setReviews(data.reviews)
      setAverageRating(data.average_rating)
      setCount(data.count)
    } catch (err: any) {
      setError(err?.message || "Failed to load reviews")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  useEffect(() => {
    const checkIfUserReviewed = async () => {
      if (!customer) {
        setHasReviewed(false)
        return
      }

      setIsCheckingReview(true)
      try {
        const response = await fetch(
          `/api/reviews/check?product_id=${productId}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        )

        if (response.ok) {
          const data = await response.json()
          setHasReviewed(data.hasReviewed || false)
        }
      } catch (err) {
        console.error("Error checking if user reviewed:", err)
        setHasReviewed(false)
      } finally {
        setIsCheckingReview(false)
      }
    }

    if (customer && !sessionLoading) {
      checkIfUserReviewed()
    } else if (!customer) {
      setHasReviewed(false)
    }
  }, [customer, productId, sessionLoading])

  const handleReviewCreated = () => {
    // Refresh reviews after a new one is created
    fetchReviews()
    // Update hasReviewed status
    setHasReviewed(true)
  }

  if (isLoading) {
    return (
      <div className="product-page-constraint pb-4">
        <div className="flex flex-col mt-5 mb-5">
          <span className="text-2xl font-semibold text-gray-700 font-urbanist">
            Reviews
          </span>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
          <div className="h-24 sm:h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-page-constraint pb-5">
        <div className="flex flex-col mt-5 mb-5">
          <span className="text-2xl font-semibold text-gray-700 font-urbanist">
            Reviews
          </span>
        </div>
        <div className="text-sm sm:text-base text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="product-page-constraint pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-5 mb-5 gap-3 sm:gap-4">
        <span className="text-2xl font-semibold text-gray-700 font-urbanist">
          Reviews
        </span>

        {/* Write Review Button */}
        {!sessionLoading && customer && !hasReviewed && !isCheckingReview && (
          <CreateReviewForm
            productId={productId}
            onReviewCreated={handleReviewCreated}
          />
        )}
      </div>

      {/* Average Rating Summary */}
      {count > 0 && (
        <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-md">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {averageRating.toFixed(1)}
              </div>
            </div>
            <div className="flex-1">
              <StarRating rating={Math.round(averageRating)} />
              <Text className="text-sm sm:text-base text-gray-700 mt-2 font-medium">
                Based on {count} {count === 1 ? "review" : "reviews"}
              </Text>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Carousel */}
      {reviews.length > 0 ? (
        <div className="mb-4 sm:mb-6">
          <Swiper
            modules={[Pagination]}
            spaceBetween={16}
            slidesPerView={1}
            slidesPerGroup={1}
            pagination={{
              el: ".reviews-pagination",
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 20,
              },
            }}
            className="reviews-carousel"
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id}>
                <ReviewItem review={review} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Centered pagination placed after the cards */}
          <div className="flex items-center justify-center mt-4 sm:mt-6">
            <div className="reviews-pagination"></div>
          </div>
        </div>
      ) : (
        <div className="mb-4 sm:mb-6 py-6 sm:py-8 text-center">
          <Text className="text-sm sm:text-base text-gray-600 mb-4">
            No reviews yet. Be the first to review this product!
          </Text>
          {!sessionLoading && customer && !hasReviewed && (
            <CreateReviewForm
              productId={productId}
              onReviewCreated={handleReviewCreated}
            />
          )}
        </div>
      )}

      {/* Message for users who are not logged in */}
      {!sessionLoading && !customer && (
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 text-center">
          <Text className="text-sm sm:text-base text-gray-600">
            Please log in to write a review.
          </Text>
        </div>
      )}
    </div>
  )
}
