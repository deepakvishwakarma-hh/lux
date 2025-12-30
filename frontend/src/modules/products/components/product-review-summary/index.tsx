import { ReviewsResponse } from "@lib/data/reviews"

type ProductReviewSummaryProps = {
  reviewSummary: ReviewsResponse | null
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
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

export default function ProductReviewSummary({
  reviewSummary,
}: ProductReviewSummaryProps) {
  // If no reviews, don't show anything
  if (
    !reviewSummary ||
    reviewSummary.count === 0 ||
    reviewSummary.average_rating === 0
  ) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <StarRating rating={Math.round(reviewSummary.average_rating)} />
        <span className="text-sm font-semibold text-gray-900">
          {reviewSummary.average_rating.toFixed(1)}
        </span>
      </div>
      <span className="text-sm text-gray-600">
        ({reviewSummary.count}{" "}
        {reviewSummary.count === 1 ? "review" : "reviews"})
      </span>
    </div>
  )
}
