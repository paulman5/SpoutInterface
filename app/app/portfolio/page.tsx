"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  RefreshCw,
  Zap,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useTokenBalance } from "@/hooks/view/onChain/useTokenBalance"
import { useMarketData } from "@/hooks/api/useMarketData"
import { useAccount } from "wagmi"
import { useCurrentUser } from "@/hooks/auth/useCurrentUser"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { useRecentActivity } from "@/hooks/view/onChain/useRecentActivity"
import { Activity } from "lucide-react"
import { useReturns } from "@/hooks/api/useReturns"
import { Suspense } from "react"
import Image from "next/image"

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
  } = useMarketData("LQD") // Using SLQD as price reference

  const { returns, isLoading: returnsLoading } = useReturns("SLQD")

  const { username } = useCurrentUser()

  const {
    activities,
    isLoading: activitiesLoading,
    hasMore,
    loadMore,
  } = useRecentActivity(userAddress)

  // Format number to whole numbers without decimals
  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString()
  }

  // Format percentage to 2 decimal places for cleaner display
  const formatPercent = (num: number) => {
    return Number(num.toFixed(2))
  }

  // Portfolio data using actual token balance and market price
  const portfolioValue =
    tokenBalance && currentPrice ? tokenBalance * currentPrice : 0

  // Calculate daily change based on previous close
  const previousDayValue =
    tokenBalance && previousClose ? tokenBalance * previousClose : 0

  const dayChange = portfolioValue - previousDayValue
  const dayChangePercent =
    previousDayValue > 0
      ? ((portfolioValue - previousDayValue) / previousDayValue) * 100
      : 0

  // Calculate total return based on current market price vs previous close
  const totalReturn = dayChange // Use the same daily change value
  const totalReturnPercent = dayChangePercent // Use the same percentage

  console.log("Portfolio return information", {
    tokenBalance,
    currentPrice,
    previousClose,
  })

  const holdings = [
    {
      symbol: tokenSymbol || "SLQD",
      name: "Spout US Corporate Bond Token",
      shares: tokenBalance || 0,
      avgPrice: previousClose || 0,
      currentPrice: currentPrice ?? 0,
      value: portfolioValue,
      dayChange: formatPercent(dayChangePercent),
      totalReturn: formatPercent(totalReturnPercent),
      allocation: 100,
    },
  ]

  // Show loading spinner overlay but keep the blue dashboard background
  const isLoading = balanceLoading || priceLoading || returnsLoading

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="inline-flex items-center space-x-2">
                <Badge variant="outline" className="text-white border-white/20">
                  Live Portfolio
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:text-white/80"
                        aria-label="Refresh"
                        onClick={() => window.location.reload()}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Refresh</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <h1 className="text-2xl font-bold mt-2">
                {username
                  ? `Welcome back${username ? ", " + username : ""}`
                  : "Portfolio Overview"}
              </h1>
            </div>
            <div className="mt-6 md:mt-0 text-right">
              <div className="text-3xl font-bold mb-2">
                ${formatNumber(portfolioValue)}
              </div>
              <div
                className={`flex items-center justify-end text-lg ${dayChange >= 0 ? "text-green-300" : "text-red-300"}`}
              >
                {dayChange >= 0 ? (
                  <TrendingUp className="h-5 w-5 mr-2" />
                ) : (
                  <TrendingDown className="h-5 w-5 mr-2" />
                )}
                ${formatNumber(Math.abs(dayChange))} (
                {dayChangePercent >= 0 ? "+" : ""}
                {formatPercent(dayChangePercent)}%)
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Link href="/app/trade">
              <Button variant="white" className="text-blue-600 font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Add Position
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Loading spinner/message below the blue dashboard header */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your portfolio...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Value Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${formatNumber(portfolioValue)}
                </div>
                <div
                  className={`flex items-center text-xs ${dayChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {dayChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  ${formatNumber(Math.abs(dayChange))} (
                  {dayChangePercent >= 0 ? "+" : ""}
                  {formatPercent(dayChangePercent)}%) today
                </div>
              </CardContent>
            </Card>

            {/* Total Return Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Return
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {totalReturn >= 0 ? "+" : "-"}$
                  {formatNumber(Math.abs(totalReturn))}
                </div>
                <div
                  className={`flex items-center text-xs ${totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {totalReturn >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {totalReturnPercent >= 0 ? "+" : ""}
                  {formatPercent(totalReturnPercent)}% all time
                </div>
              </CardContent>
            </Card>

            {/* Positions Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Positions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{holdings.length}</div>
                <p className="text-xs text-muted-foreground">Active holdings</p>
              </CardContent>
            </Card>
          </div>

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

            {/* Holdings Tab */}
            <TabsContent value="holdings" className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your Holdings</CardTitle>
                      <CardDescription>
                        Current positions in your portfolio
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-700"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Live Prices
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {holdings.map((holding) => (
                      <div
                        key={holding.symbol}
                        className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center relative overflow-hidden">
                            {/* Show SLQD logo if symbol is SLQD */}
                            {holding.symbol === "SLQD" ? (
                              <Image
                                src="/partners/SLQD.png"
                                alt="SLQD logo"
                                fill
                                style={{ objectFit: "cover" }}
                                className="rounded-2xl"
                              />
                            ) : (
                              <span className="font-bold text-white text-lg">
                                {holding.symbol[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {holding.symbol}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {holding.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatNumber(holding.shares)} shares @ $
                              {holding.currentPrice}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            ${holding.value.toLocaleString()}
                          </p>
                          <p
                            className={`text-sm font-medium ${holding.dayChange >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {holding.dayChange >= 0 ? "+" : ""}
                            {holding.dayChange}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {holding.allocation}% of portfolio
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href="/app/trade">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-blue-50"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>Trade</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Portfolio Allocation</CardTitle>
                    <CardDescription>Distribution by holdings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {holdings.map((holding, index) => (
                        <div
                          key={holding.symbol}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                index === 0
                                  ? "bg-blue-500"
                                  : index === 1
                                    ? "bg-emerald-500"
                                    : index === 2
                                      ? "bg-purple-500"
                                      : "bg-orange-500"
                              }`}
                            ></div>
                            <span className="text-sm font-medium">
                              {holding.symbol}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600 font-semibold">
                            {holding.allocation}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Key portfolio statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm text-gray-600">
                          30-Day Return
                        </span>
                        <span
                          className={`text-sm font-medium ${returns.thirtyDayReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {returns.thirtyDayReturn >= 0 ? "+" : ""}
                          {formatPercent(returns.thirtyDayReturn)}%
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm text-gray-600">
                          90-Day Return
                        </span>
                        <span
                          className={`text-sm font-medium ${returns.ninetyDayReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {returns.ninetyDayReturn >= 0 ? "+" : ""}
                          {formatPercent(returns.ninetyDayReturn)}%
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm text-gray-600">
                          1-Year Return
                        </span>
                        <span
                          className={`text-sm font-medium ${returns.yearReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {returns.yearReturn >= 0 ? "+" : ""}
                          {formatPercent(returns.yearReturn)}%
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm text-gray-600">
                          Volatility
                        </span>
                        <span className="text-sm font-medium">18.4%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm text-gray-600">
                          Sharpe Ratio
                        </span>
                        <span className="text-sm font-medium">1.24</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="border border-slate-200/60 shadow-sm bg-white">
                <CardHeader className="pb-0 border-b border-slate-100/80">
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-slate-900 to-slate-700 rounded-full"></div>
                        <div>
                          <CardTitle className="text-lg font-medium text-slate-900 tracking-tight">
                            Transaction history{" "}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className="text-xs text-slate-600 border-slate-300"
                      >
                        LIVE
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {activitiesLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">
                          LOADING TRANSACTION DATA
                        </span>
                      </div>
                    </div>
                  ) : !activities || activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-12 h-12 border-2 border-slate-200 rounded-lg flex items-center justify-center mb-4">
                        <Activity className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        NO TRANSACTION DATA
                      </p>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">
                        HISTORY WILL POPULATE AFTER FIRST TRANSACTION
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                        <div className="col-span-1">TYPE</div>
                        <div className="col-span-3">TRANSACTION</div>
                        <div className="col-span-2">AMOUNT</div>
                        <div className="col-span-2">VALUE (USD)</div>
                        <div className="col-span-2">TIME</div>
                        <div className="col-span-2">STATUS</div>
                      </div>

                      {/* Transaction Rows */}
                      <div className="divide-y divide-slate-100/60">
                        {activities.map((activity, index) => (
                          <div
                            key={activity.id}
                            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50/30 transition-colors duration-150 group"
                          >
                            {/* Type Indicator */}
                            <div className="col-span-1 flex items-center">
                              <div
                                className={`w-3 h-3 rounded-sm ${
                                  activity.action === "Burned"
                                    ? "bg-red-500 shadow-red-500/30"
                                    : "bg-emerald-500 shadow-emerald-500/30"
                                } shadow-lg`}
                              ></div>
                            </div>

                            {/* Transaction Details */}
                            <div className="col-span-3 flex flex-col justify-center">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-slate-900">
                                  {activity.action === "Burned"
                                    ? "SOLD"
                                    : "PURCHASED"}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0.5 h-auto"
                                >
                                  SLQD
                                </Badge>
                              </div>
                              <span className="text-xs text-slate-500 mt-0.5">
                                {activity.transactionType}
                              </span>
                            </div>

                            {/* Amount */}
                            <div className="col-span-2 flex flex-col justify-center">
                              <span className="text-sm text-slate-900">
                                {activity.amount}
                              </span>
                            </div>

                            {/* USD Value */}
                            <div className="col-span-2 flex flex-col justify-center">
                              <span
                                className={`text-sm font-medium ${
                                  activity.action === "Burned"
                                    ? "text-red-600"
                                    : "text-emerald-600"
                                }`}
                              >
                                {activity.value}
                              </span>
                              <span className="text-xs text-slate-500">
                                USD
                              </span>
                            </div>

                            {/* Time */}
                            <div className="col-span-2 flex flex-col justify-center">
                              <span className="text-sm text-slate-900">
                                {activity.time}
                              </span>
                              <span className="text-xs text-slate-500">
                                AGO
                              </span>
                            </div>

                            {/* Status */}
                            <div className="col-span-2 flex items-center">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-slate-600 uppercase tracking-wide">
                                  CONFIRMED
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {hasMore && (
                        <div className="border-t border-slate-100 bg-slate-50/30">
                          <Button
                            variant="ghost"
                            onClick={loadMore}
                            className="w-full h-12 text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-200"
                          >
                            LOAD MORE TRANSACTIONS
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
export default function PortfolioPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PortfolioPage />
    </Suspense>
  )
}
