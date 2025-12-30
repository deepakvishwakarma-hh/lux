"use client"

import { useState, useEffect } from "react"
import { Text, Button } from "@medusajs/ui"
import type { Review } from "@lib/data/reviews"
import CreateReviewForm from "../create-review-form"
import { useSession } from "@lib/hooks/use-session"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

type ProductReviewsProps = {
  productId: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${
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
    <div className="h-full p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Text className="font-semibold text-gray-900 text-sm">
                {review.first_name} {review.last_name}
              </Text>
            </div>
            <StarRating rating={review.rating} />
          </div>
          <Text className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {formattedDate}
          </Text>
        </div>
        {review.title && (
          <Text className="text-base font-medium text-gray-800 mb-2">
            {review.title}
          </Text>
        )}
        <Text className="text-sm text-gray-700 leading-relaxed flex-1 line-clamp-4">
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
      <div className="product-page-constraint pb-10">
        <div className="flex flex-col mt-5 mb-5">
          <span className="text-2xl font-urbanist font-semibold text-gray-700">
            Reviews
          </span>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-page-constraint pb-10">
        <div className="flex flex-col mt-5 mb-5">
          <span className="text-2xl font-urbanist font-semibold text-gray-700">
            Reviews
          </span>
        </div>
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="product-page-constraint pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-5 mb-5 gap-4">
        <span className="text-2xl font-urbanist font-semibold text-gray-700">
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
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <StarRating rating={Math.round(averageRating)} />
              <Text className="text-sm text-gray-600 mt-1">
                Based on {count} {count === 1 ? "review" : "reviews"}
              </Text>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Carousel */}
      {reviews.length > 0 ? (
        <div className="mb-6">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            slidesPerGroup={1}
            navigation={reviews.length > 3}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                slidesPerGroup: 2,
              },
              1024: {
                slidesPerView: 3,
                slidesPerGroup: 3,
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
        </div>
      ) : (
        <div className="mb-6 py-8 text-center">
          <Text className="text-gray-600 mb-4">
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
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <Text className="text-gray-600">
            Please log in to write a review.
          </Text>
        </div>
      )}
    </div>
  )
}
