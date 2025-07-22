import { useState, useEffect, useCallback } from "react"
import { StockData } from "@/lib/types/markets"
import { fetchAllStocks } from "@/lib/services/marketData"

export function useMarketStocks() {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchStocks = useCallback(async () => {
    setRefreshing(true)
    try {
      const results = await fetchAllStocks()
      setStocks(results)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching stocks:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchStocks()
  }, [fetchStocks])

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return {
    stocks: filteredStocks,
    loading,
    refreshing,
    lastUpdated,
    searchTerm,
    setSearchTerm,
    refresh: fetchStocks,
  }
}
