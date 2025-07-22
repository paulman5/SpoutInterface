import { StockData } from "@/lib/types/markets"
import { formatMarketCap, formatVolume } from "@/lib/utils/formatters"

// Popular stocks with company names - prices will be fetched from API
const popularStocks = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 0, // Will be updated from API
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "AMZN",
    name: "Amazon.com, Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "META",
    name: "Meta Platforms, Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "IBM",
    name: "IBM Corporation",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
]

export const fetchStockData = async (ticker: string): Promise<StockData> => {
  try {
    const response = await fetch(`/api/stocks/${ticker}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Return a properly formatted StockData object with fallbacks
    return {
      ticker: data.ticker || ticker,
      name: popularStocks.find((s) => s.ticker === ticker)?.name || ticker,
      price: data.currentPrice ?? null,
      change: data.priceChange ?? null,
      changePercent: data.priceChangePercent ?? null,
      volume: formatVolume(data.volume),
      marketCap: formatMarketCap(data.marketCap),
      dataSource: data.dataSource || "mock",
    }
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error)
    // Return a StockData object with null/empty values on error
    return {
      ticker,
      name: popularStocks.find((s) => s.ticker === ticker)?.name || ticker,
      price: null,
      change: null,
      changePercent: null,
      volume: "0",
      marketCap: "$0",
      dataSource: "mock",
    }
  }
}

export const fetchAllStocks = async (): Promise<StockData[]> => {
  try {
    const promises = popularStocks.map((stock) => fetchStockData(stock.ticker))
    const results = await Promise.all(promises)

    const validStocks = results.filter((stock) => stock !== null) as StockData[]
    return validStocks
  } catch (error) {
    console.error("Error fetching stocks:", error)
    return []
  }
}

export { popularStocks }
