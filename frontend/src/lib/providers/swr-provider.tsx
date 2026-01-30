"use client"

import { SWRConfig } from "swr"
import { ReactNode } from "react"

type SWRProviderProps = {
  children: ReactNode
}

/**
 * Global SWR configuration provider
 * 
 * Default settings:
 * - revalidateOnFocus: false - Prevents unnecessary refetches when user switches tabs
 * - revalidateOnReconnect: true - Refetches data when network reconnects
 * - dedupingInterval: 2000 - Deduplicates requests within 2 seconds
 * - errorRetryCount: 3 - Retries failed requests up to 3 times
 * - errorRetryInterval: 5000 - Waits 5 seconds between retries
 * - focusThrottleInterval: 5000 - Throttles revalidation on focus
 * - loadingTimeout: 3000 - Timeout to trigger loading slow event
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Revalidation settings
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
        
        // Deduplication - prevents duplicate requests
        dedupingInterval: 2000,
        
        // Error handling
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        shouldRetryOnError: (error) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          // Retry on 5xx errors (server errors) and network errors
          return true
        },
        
        // Focus throttle - throttle revalidation on focus
        focusThrottleInterval: 5000,
        
        // Loading timeout
        loadingTimeout: 3000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
