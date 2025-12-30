"use client"

import { useState, useEffect } from "react"
import { Button, Text, Textarea, Input, Heading } from "@medusajs/ui"
import { useSession } from "@lib/hooks/use-session"
import Modal from "@modules/common/components/modal"
import useToggleState from "@lib/hooks/use-toggle-state"

type CreateReviewFormProps = {
  productId: string
  onReviewCreated?: () => void
}

export default function CreateReviewForm({
  productId,
  onReviewCreated,
}: CreateReviewFormProps) {
  const { customer, isLoading: sessionLoading } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { state, open, close } = useToggleState(false)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    rating: 5,
    first_name: "",
    last_name: "",
  })

  // Update form data when customer data loads
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
      }))
    }
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: productId,
          title: formData.title || undefined,
          content: formData.content,
          rating: formData.rating,
          first_name: formData.first_name,
          last_name: formData.last_name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to submit review")
      }

      setSuccess(true)
      setFormData({
        title: "",
        content: "",
        rating: 5,
        first_name: customer?.first_name || "",
        last_name: customer?.last_name || "",
      })

      // Close modal after a short delay to show success message
      setTimeout(() => {
        close()
        setSuccess(false)
        if (onReviewCreated) {
          onReviewCreated()
        }
      }, 1500)
    } catch (err: any) {
      setError(
        err?.message || "Failed to submit review. Please try again later."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    close()
    setError(null)
    setSuccess(false)
    setFormData({
      title: "",
      content: "",
      rating: 5,
      first_name: customer?.first_name || "",
      last_name: customer?.last_name || "",
    })
  }

  if (sessionLoading || !customer) {
    return null
  }

  return (
    <>
      <Button onClick={open} className="w-full md:w-auto">
        Write a Review
      </Button>

      <Modal isOpen={state} close={handleClose} size="medium">
        <Modal.Title>
          <Heading className="mb-2">Write a Review</Heading>
        </Modal.Title>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="w-full space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <Input
                    id="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <Input
                    id="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title (Optional)
                </label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  disabled={isSubmitting}
                  placeholder="Give your review a title"
                />
              </div>

              <div>
                <label htmlFor="rating" className="block text-sm font-medium mb-1">
                  Rating
                </label>
                <select
                  id="rating"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: parseInt(e.target.value) })
                  }
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">
                  Review
                </label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                  rows={4}
                  placeholder="Share your thoughts about this product..."
                  className="w-full"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              {success && (
                <div className="text-green-600 text-sm">
                  Review submitted successfully! It will be visible after approval.
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}
