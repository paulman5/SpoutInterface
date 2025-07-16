import { useMarketData } from "./useMarketData"
import { useYieldData } from "./useYieldData"

export function useReturns(symbol: string) {
  const { data: marketData, isLoading: marketLoading } = useMarketData(symbol)
  const { data: yieldData, isLoading: yieldLoading } = useYieldData(symbol)

  // Calculate returns including yield
  const calculateReturn = (days: number) => {
    if (!marketData || !yieldData) return 0

    // Get the annual yield rate
    const annualYieldRate = yieldData.yield || 0

    // Calculate daily yield rate (simple division by 365)
    const dailyYieldRate = annualYieldRate / 365

    // Calculate price return (using a simple approximation)
    const priceReturn =
      ((marketData.price - marketData.previousClose) /
        marketData.previousClose) *
      100

    // Calculate yield return for the period
    const yieldReturn = dailyYieldRate * days

    // Total return is price return plus yield return
    return priceReturn + yieldReturn
  }

  const returns = {
    thirtyDayReturn: calculateReturn(30),
    ninetyDayReturn: calculateReturn(90),
    yearReturn: calculateReturn(365),
  }

  const isLoading = marketLoading || yieldLoading

  return { returns, isLoading }
}
