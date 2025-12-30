"use client"

import useSWR from "swr"
import { HttpTypes } from "@medusajs/types"

/**
 * Fetcher function for SWR to fetch customer session data from API
 */
const sessionFetcher = async (): Promise<HttpTypes.StoreCustomer | null> => {
  try {
    const response = await fetch("/api/customer/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      // If 401 or other error, user is not authenticated
      return null
    }

    const data = await response.json()
    return data || null
  } catch (error) {
    // If error, user is not authenticated
    return null
  }
}

/**
 * Custom hook to fetch customer session data from /api/customer/me using SWR
 * This hook caches the session data and can be used in client-side components
 * 
 * @returns {Object} Object containing:
 *   - customer: The customer data or null if not authenticated
 *   - isLoading: Boolean indicating if the request is in progress
 *   - isError: Error object if the request failed
 *   - mutate: Function to manually revalidate the session data
 */
export function useSession() {
  const { data, error, isLoading, mutate } = useSWR<HttpTypes.StoreCustomer | null>(
    "/api/customer/me",
    sessionFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      shouldRetryOnError: false,
    }
  )

  return {
    customer: data ?? null,
    isLoading,
    isError: error,
    mutate,
  }
}

