"use client"

import { useSession } from "@lib/hooks/use-session"

export default function TestPage() {
  const { customer, isLoading, isError } = useSession()

  if (isLoading) {
    return <div>Loading session...</div>
  }

  if (isError) {
    return <div>Error loading session</div>
  }

  return (
    <div>
      <h1>Test Page - Session Data</h1>
      <pre>{JSON.stringify(customer, null, 2)}</pre>
    </div>
  )
}
