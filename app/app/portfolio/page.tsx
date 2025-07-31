"use client"

import PortfolioHeader from "@/components/features/portfolio/portfolioheader"
import PortfolioSummaryCards from "@/components/features/portfolio/portfoliosummarycards"
import PortfolioHoldings from "@/components/features/portfolio/portfolioholdings"
import PortfolioPerformance from "@/components/features/portfolio/portfolioperformance"
import PortfolioActivity from "@/components/features/portfolio/portfolioactivity"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useTokenBalance } from "@/hooks/view/onChain/useTokenBalance"
import { useMarketData } from "@/hooks/api/useMarketData"
import { useAccount } from "wagmi"
import { useCurrentUser } from "@/hooks/auth/useCurrentUser"
import { useRecentActivity } from "@/hooks/view/onChain/useRecentActivity"
import { useReturns } from "@/hooks/api/useReturns"
import { RefreshCw } from "lucide-react"

function PortfolioPage() {
  const { address: userAddress } = useAccount()
  const {
    balance: tokenBalance,
    symbol: tokenSymbol,
    isLoading: balanceLoading,
    isError: balanceError,
  } = useTokenBalance(userAddress)

  const {
    price: currentPrice,
    previousClose,
    isLoading: priceLoading,
    error: priceError,
  } = useMarketData("LQD")

  const { returns, isLoading: returnsLoading } = useReturns("SLQD")
  const { username } = useCurrentUser()
  const {
    activities,
    isLoading: activitiesLoading,
    hasMore,
    loadMore,
  } = useRecentActivity(userAddress)

  // Format number to 3 decimals, matching holdings value
  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })
  }
  const formatPercent = (num: number) => num.toFixed(2)

  const portfolioValue =
    tokenBalance && currentPrice ? tokenBalance * currentPrice : 0
  const previousDayValue =
    tokenBalance && previousClose ? tokenBalance * previousClose : 0
  const dayChange = portfolioValue - previousDayValue
  const dayChangePercent =
    previousDayValue > 0
      ? ((portfolioValue - previousDayValue) / previousDayValue) * 100
      : 0
  const totalReturn = dayChange
  const totalReturnPercent = dayChangePercent

  const holdings = [
    {
      symbol: tokenSymbol || "SLQD",
      name: "Spout US Corporate Bond Token",
      shares: tokenBalance || 0,
      avgPrice: previousClose || 0,
      currentPrice: currentPrice ?? 0,
      value: portfolioValue,
      dayChange: dayChangePercent, // number, not formatted string
      totalReturn: totalReturnPercent, // number, not formatted string
      allocation: 100,
    },
  ]

  const isLoading = balanceLoading || priceLoading || returnsLoading

  return (
    <div className="space-y-8">
      <PortfolioHeader
        username={username || ""}
        portfolioValue={portfolioValue}
        dayChange={dayChange}
        dayChangePercent={dayChangePercent}
        onRefresh={() => window.location.reload()}
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your portfolio...</p>
          </div>
        </div>
      ) : (
        <>
          <PortfolioSummaryCards
            portfolioValue={portfolioValue}
            dayChange={dayChange}
            dayChangePercent={dayChangePercent}
            totalReturn={totalReturn}
            totalReturnPercent={totalReturnPercent}
            holdings={holdings}
          />
          <Tabs defaultValue="holdings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100">
              <TabsTrigger
                value="holdings"
                className="data-[state=active]:bg-white"
              >
                Holdings
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="data-[state=active]:bg-white"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-white"
              >
                Activity
              </TabsTrigger>
            </TabsList>
            <TabsContent value="holdings" className="space-y-6">
              <PortfolioHoldings
                holdings={holdings}
                formatNumber={formatNumber}
              />
            </TabsContent>
            <TabsContent value="performance" className="space-y-6">
              <PortfolioPerformance
                holdings={holdings}
                returns={returns}
                formatPercent={formatPercent}
              />
            </TabsContent>
            <TabsContent value="activity" className="space-y-6">
              <PortfolioActivity
                activities={activities}
                activitiesLoading={activitiesLoading}
                hasMore={hasMore}
                loadMore={loadMore}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

export default PortfolioPage
