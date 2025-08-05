"use client"

import { useState, useEffect } from "react"

interface YieldData {
  symbol: string
  yield: number
  timestamp: string
  note?: string
}

export function useYieldData(symbol: string) {
  const [data, setData] = useState<YieldData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchYieldData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/marketdata/yields?symbol=${symbol}`)
        if (!response.ok) {
          throw new Error("Failed to fetch yield data")
        }

        const yieldData = await response.json()
        setData(yieldData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchYieldData()
  }, [symbol])

  return { data, isLoading, error }
}
