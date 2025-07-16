"use client"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Wallet,
  Settings,
  ArrowRight,
  Activity,
  DollarSign,
  PieChart,
  Zap,
} from "lucide-react"
import { useTokenBalance } from "@/hooks/view/onChain/useTokenBalance"
import { useMarketData } from "@/hooks/api/useMarketData"
import { useAccount } from "wagmi"
import { useRecentActivity } from "@/hooks/view/onChain/useRecentActivity"
import { Suspense } from "react"

function DashboardPage() {
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
  const {
    activities,
    isLoading: activitiesLoading,
    hasMore,
    loadMore,
  } = useRecentActivity(userAddress)

  // Format number to 3 decimal places
  const formatNumber = (num: number) => {
    return Number(num.toFixed(3)).toLocaleString()
  }
  // Format percentage to 2 decimal places
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

  // Holdings logic (single position if tokenBalance > 0)
  const holdings =
    tokenBalance && tokenBalance > 0
      ? [
          {
            symbol: tokenSymbol || "SUSC",
            shares: tokenBalance,
            value: portfolioValue,
          },
        ]
      : []

  const features = [
    {
      title: "Markets",
      description: "Real-time stock prices and market analytics",
      icon: BarChart3,
      href: "/app/markets",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      stats: "500+ Stocks",
      soon: true,
    },
    {
      title: "Portfolio",
      description: "Track performance and manage investments",
      icon: TrendingUp,
      href: "/app/portfolio",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      stats: `$${formatNumber(portfolioValue)}`,
      soon: false,
    },
    {
      title: "Trade",
      description: "Swap tokens and execute trades instantly",
      icon: Wallet,
      href: "/app/trade",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      stats: "0.1% Fees",
      soon: false,
    },
    {
      title: "Settings",
      description: "Configure account and preferences",
      icon: Settings,
      href: "/app/settings",
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      stats: "Secure",
      soon: true,
    },
  ]

  const quickStats = [
    {
      title: "Portfolio Value",
      value: `$${formatNumber(portfolioValue)}`,
      change: `${dayChange >= 0 ? "+" : "-"}$${formatNumber(Math.abs(dayChange))} (${dayChangePercent >= 0 ? "+" : "-"}${formatPercent(Math.abs(dayChangePercent))}%)`,
      positive: dayChange >= 0,
      icon: DollarSign,
    },
    {
      title: "Active Positions",
      value: holdings.length.toString(),
      change: "Stocks & Tokens",
      positive: null,
      icon: PieChart,
    },
    {
      title: "Today's P&L",
      value: `${dayChange >= 0 ? "+" : "-"}$${formatNumber(Math.abs(dayChange))}`,
      change: `${dayChangePercent >= 0 ? "+" : "-"}${formatPercent(Math.abs(dayChangePercent))}%`,
      positive: dayChange >= 0,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Badge
              variant="static"
              className="bg-white/20 text-white border-white/30"
            >
              <Zap className="w-4 h-4 mr-2" />
              Live Dashboard
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-3">Welcome back</h1>
          <p className="text-emerald-100 text-lg mb-6 max-w-2xl">
            Your portfolio is performing well today. Track your investments,
            execute trades, and stay ahead of the market.
          </p>
          <div className="flex gap-4">
            <Link href="/app/trade">
              <Button
                variant="white"
                className="text-emerald-600 font-semibold"
              >
                Start Trading
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/app/markets">
              <Button variant="white-outline">View Markets</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300 border-0 shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <IconComponent className="h-5 w-5 text-emerald-600" />
                  </div>
                  {stat.positive !== null && (
                    <Badge
                      variant={stat.positive ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {stat.positive ? "↗" : "↘"}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm ${
                      stat.positive === true
                        ? "text-emerald-600"
                        : stat.positive === false
                          ? "text-red-600"
                          : "text-slate-500"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const IconComponent = feature.icon
          const cardContent = (
            <Card
              className={`hover:shadow-xl transition-all duration-300 group border-0 shadow-md ${feature.soon ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 ${feature.bgColor} rounded-2xl group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {feature.stats}
                    </Badge>
                    {feature.soon && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                      >
                        Soon
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-emerald-600 font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                  {feature.soon ? "Coming Soon" : `Open ${feature.title}`}
                  {!feature.soon && <ArrowRight className="ml-2 h-4 w-4" />}
                </div>
              </CardContent>
            </Card>
          )
          return feature.soon ? (
            <div key={feature.title}>{cardContent}</div>
          ) : (
            <Link
              key={feature.title}
              href={feature.href}
              tabIndex={0}
              aria-disabled={false}
            >
              {cardContent}
            </Link>
          )
        })}
      </div>

      {/* Recent Activity */}
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
          ) : activities.length === 0 ? (
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
                          {activity.action === "Burned" ? "SOLD" : "PURCHASED"}
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
                      <span className="text-xs text-slate-500">USD</span>
                    </div>

                    {/* Time */}
                    <div className="col-span-2 flex flex-col justify-center">
                      <span className="text-sm text-slate-900">
                        {activity.time}
                      </span>
                      <span className="text-xs text-slate-500">AGO</span>
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
    </div>
  )
}

export default function AppPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPage />
    </Suspense>
  )
}
