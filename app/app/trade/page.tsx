"use client"
import StockChart from "@/components/stockChart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowUpDown,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCcw,
} from "lucide-react"
import React, { useEffect, useState, useCallback } from "react"
import { useAccount, useConfig } from "wagmi"
import { encryptValue } from "@/lib/inco-lite"
import { useERC20Approve } from "@/hooks/writes/onChain/useERC20Approve"
import { useOrdersContract } from "@/hooks/writes/onChain/useOrders"
import { waitForTransactionReceipt } from "wagmi/actions"
import { useTokenBalance } from "@/hooks/view/onChain/useTokenBalance"
import { useUSDCTokenBalance } from "@/hooks/view/onChain/useUSDCTokenBalance"
import { useContractAddress } from "@/lib/addresses"

const TOKENS = [
  { label: "LQD", value: "LQD" },
  // { label: "MSFT", value: "MSFT" },
  // { label: "AAPL", value: "AAPL" },
]

// Trading log types
type LogType =
  | "ORDER_SUBMITTED"
  | "ORDER_PENDING"
  | "ORDER_FILLED"
  | "ORDER_FAILED"
  | "APPROVAL_SUCCESS"
  | "ENCRYPTION_SUCCESS"

interface TradeLogEntry {
  id: string
  time: string
  type: LogType
  message: string
  txHash?: string
  amount?: string
  token?: string
}

const Page = () => {
  const [selectedToken, setSelectedToken] = useState("LQD")
  const [tokenData, setTokenData] = useState<any[]>([])
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [buyUsdc, setBuyUsdc] = useState("")
  const [sellToken, setSellToken] = useState("")
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [tradeLogs, setTradeLogs] = useState<TradeLogEntry[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [chartDataSource, setChartDataSource] = useState<"real" | "mock">(
    "real"
  )
  const [etfData, setEtfData] = useState<any>(null)

  // Mock USDC balance only
  const [mockUsdcBalance, setMockUsdcBalance] = useState(4532)

  const { address: userAddress } = useAccount()
  const {
    balance: tokenBalance,
    symbol: tokenSymbol,
    isLoading: balanceLoading,
  } = useTokenBalance(userAddress)
  const ordersAddress = useContractAddress("orders") as `0x${string}`
  const usdcAddress = useContractAddress("usdc") as `0x${string}`
  const rwaTokenAddress = useContractAddress("rwatoken") as `0x${string}`
  const { approve, isPending: isApprovePending } = useERC20Approve(usdcAddress)
  const { buyAsset, sellAsset, isPending: isOrderPending } = useOrdersContract()
  const config = useConfig()
  const {
    balance: usdcBalance,
    isLoading: usdcLoading,
    isError: usdcError,
  } = useUSDCTokenBalance(userAddress)

  // Test ETF data fetch
  useEffect(() => {
    async function fetchETFData() {
      try {
        console.log("Fetching ETF data for:", selectedToken)
        const response = await fetch(`/api/stocks/${selectedToken}`)
        const data = await response.json()
        console.log("ETF Response:", data)
        setEtfData(data)
      } catch (error) {
        console.error("Error fetching ETF data:", error)
      }
    }
    fetchETFData()
  }, [selectedToken])

  // Generate mock chart data if needed
  function generateMockData(ticker: string) {
    const basePrice =
      {
        SLQD: 108.5, // iShares iBoxx $ Investment Grade Corporate Bond ETF
      }[ticker] || 150.0

    const data = []
    const today = new Date()

    for (let i = 99; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue

      const randomFactor = 0.95 + Math.random() * 0.1 // ±5% variation
      const price = basePrice * randomFactor
      const variance = price * 0.02 // 2% intraday variance

      const open = price + (Math.random() - 0.5) * variance
      const close = price + (Math.random() - 0.5) * variance
      const high = Math.max(open, close) + Math.random() * variance * 0.5
      const low = Math.min(open, close) - Math.random() * variance * 0.5
      const volume = Math.floor(50000000 + Math.random() * 100000000) // 50M-150M volume

      data.push({
        time: date.toISOString().split("T")[0],
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume,
      })
    }

    return data
  }

  // Fetch historical data for chart
  useEffect(() => {
    async function fetchChartData() {
      setLoading(true)
      try {
        // Try to fetch real data first
        const res = await fetch(`/api/stocks/${selectedToken}`)
        const json = await res.json()

        // Even if we get an error, we should still set some data
        if (json.error) {
          console.log(
            `❌ Chart data fetch failed, using mock data for ${selectedToken}`
          )
          const mockData = generateMockData(selectedToken)
          setTokenData(mockData)
          setChartDataSource("mock")
        } else {
          setTokenData(json.data || [])
          setChartDataSource(json.dataSource)
          console.log(
            `✅ ${json.dataSource} chart data loaded for ${selectedToken}`
          )
        }
      } catch (e) {
        console.error("Error fetching chart data:", e)
        // Fall back to mock data on any error
        console.log(
          `❌ Chart data fetch failed, using mock data for ${selectedToken}`
        )
        const mockData = generateMockData(selectedToken)
        setTokenData(mockData)
        setChartDataSource("mock")
      } finally {
        setLoading(false)
      }
    }
    fetchChartData()
  }, [selectedToken])

  // Fetch real-time price data from Alpaca
  useEffect(() => {
    let isMounted = true

    async function fetchPriceData() {
      try {
        const res = await fetch(`/api/marketdata?symbol=${selectedToken}`)
        const json = await res.json()

        if (!isMounted) return

        if (json.price) {
          setCurrentPrice(json.price)
        } else {
          // If no price data, use mock price
          setCurrentPrice(108.5)
        }
      } catch (e) {
        console.error("Error fetching price data:", e)
        if (isMounted) {
          // Set fallback price on error
          setCurrentPrice(108.5)
        }
      }
    }

    fetchPriceData() // Initial fetch
    const interval = setInterval(fetchPriceData, 5000) // Update every 5 seconds

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [selectedToken])

  // Get latest price and market data with fallbacks
  const latestPrice =
    currentPrice ||
    (tokenData.length > 0 ? tokenData[tokenData.length - 1].close : 108.5)
  const prevPrice =
    tokenData.length > 1 ? tokenData[tokenData.length - 2].close : latestPrice
  const priceChange = latestPrice - prevPrice
  const priceChangePercent = prevPrice > 0 ? (priceChange / prevPrice) * 100 : 0

  // Calculate fees and estimates
  const tradingFee = 0.0025 // 0.25% fee
  const estimatedTokens =
    buyUsdc && latestPrice ? (parseFloat(buyUsdc) / latestPrice).toFixed(4) : ""
  const estimatedUsdc =
    sellToken && latestPrice
      ? (parseFloat(sellToken) * latestPrice).toFixed(2)
      : ""

  // Fee calculations
  const buyFeeUsdc = buyUsdc
    ? (parseFloat(buyUsdc) * tradingFee).toFixed(2)
    : ""
  const sellFeeUsdc = estimatedUsdc
    ? (parseFloat(estimatedUsdc) * tradingFee).toFixed(2)
    : ""
  const netReceiveTokens = estimatedTokens
    ? (parseFloat(estimatedTokens) * (1 - tradingFee)).toFixed(4)
    : ""
  const netReceiveUsdc = estimatedUsdc
    ? (parseFloat(estimatedUsdc) * (1 - tradingFee)).toFixed(2)
    : ""

  // Log management functions
  const addTradeLog = useCallback(
    (type: LogType, message: string, extra?: Partial<TradeLogEntry>) => {
      const newLog: TradeLogEntry = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        type,
        message,
        ...extra,
      }
      setTradeLogs((prev) => [newLog, ...prev].slice(0, 50)) // Keep last 50 logs
      console.log(`[TradeLog] ${type}: ${message}`, extra)
    },
    []
  )

  const fetchTradeLogs = useCallback(async () => {
    setLogsLoading(true)
    try {
      // Simulate fetching logs from a service
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock some initial logs
      const mockLogs: TradeLogEntry[] = [
        {
          id: "1",
          time: new Date(Date.now() - 120000).toLocaleTimeString(),
          type: "ORDER_FILLED",
          message: "Buy order filled: ***** USDC → ***** SLQD",
          amount: "*****",
          token: "SLQD",
        },
        {
          id: "2",
          time: new Date(Date.now() - 900000).toLocaleTimeString(),
          type: "ORDER_FILLED",
          message: "Sell order filled: ***** MSFT → ***** USDC",
          amount: "*****",
          token: "MSFT",
        },
        {
          id: "3",
          time: new Date(Date.now() - 3600000).toLocaleTimeString(),
          type: "ORDER_FILLED",
          message: "Buy order filled: ***** USDC → ***** AAPL",
          amount: "*****",
          token: "AAPL",
        },
      ]
      setTradeLogs(mockLogs)
    } catch (error) {
      console.error("[TradeLogs] Error fetching logs:", error)
    } finally {
      setLogsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTradeLogs()
  }, [fetchTradeLogs])

  const handleBuy = async () => {
    if (!userAddress || !buyUsdc) return
    const amount = BigInt(Math.floor(Number(buyUsdc) * 1e6)) // USDC has 6 decimals
    const usdcAmount = parseFloat(buyUsdc)
    const estimatedTokenAmount = latestPrice > 0 ? usdcAmount / latestPrice : 0

    // Step 1: Initialize order
    addTradeLog(
      "ORDER_PENDING",
      `Preparing buy order: ***** USDC → ${selectedToken}`,
      {
        amount: "*****",
        token: selectedToken,
      }
    )

    try {
      // Step 2: Silent USDC approval
      const approveTx = await approve(ordersAddress, amount)
      await waitForTransactionReceipt(config, { hash: approveTx })

      // Step 3: Encryption with delay for realism
      addTradeLog("ORDER_PENDING", "Encrypting order details using FHE...")

      const encryptedAmount = await encryptValue({
        value: amount,
        address: userAddress,
        contractAddress: ordersAddress,
      })

      // Small delay before next step
      setTimeout(() => {
        addTradeLog("ENCRYPTION_SUCCESS", "Order details encrypted and secured")
      }, 2000)

      // Step 4: Submit to blockchain with proper sequencing
      setTimeout(() => {
        addTradeLog(
          "ORDER_SUBMITTED",
          `Order submitted to blockchain: USDC → ${selectedToken}`,
          {
            amount: "*****",
            token: selectedToken,
          }
        )

        // Use Orders contract: buyAsset(adfsFeedId, ticker, token, usdcAmount)
        // You may need to determine the correct adfsFeedId for your asset
        buyAsset(
          BigInt(2000002), // adfsFeedId (replace with actual feed ID as needed)
          selectedToken,
          rwaTokenAddress,
          amount
        )
      }, 4000)

      // Step 5: Broker receives order and funds
      setTimeout(() => {
        addTradeLog(
          "ORDER_PENDING",
          `Broker received encrypted order for ${selectedToken}`
        )
        // Update USDC balance when broker receives the funds
        setMockUsdcBalance((prev) => prev - usdcAmount)

        // Log the USDC deduction
        setTimeout(() => {
          addTradeLog(
            "ORDER_PENDING",
            `USDC funds transferred to broker: -${usdcAmount.toFixed(2)} USDC`
          )
        }, 500)
      }, 7000)

      // Step 6: Order validation
      setTimeout(() => {
        addTradeLog(
          "ORDER_PENDING",
          "Validating order and checking liquidity..."
        )
      }, 10000)

      // Step 7: Market execution
      setTimeout(() => {
        addTradeLog(
          "ORDER_PENDING",
          `Executing market buy for ${selectedToken} securities`
        )
      }, 14000)

      // Step 8: Asset acquisition
      setTimeout(() => {
        addTradeLog(
          "ORDER_PENDING",
          `${selectedToken} assets acquired from market maker`
        )
      }, 18000)

      // Step 9: Token minting process
      setTimeout(() => {
        addTradeLog(
          "ORDER_PENDING",
          "Initiating ERC3643 token minting process..."
        )
      }, 22000)

      // Step 10: Compliance verification
      setTimeout(() => {
        addTradeLog(
          "ORDER_PENDING",
          "Verifying regulatory compliance and KYC status..."
        )
      }, 26000)

      // Step 11: Token delivery and minting
      setTimeout(() => {
        addTradeLog(
          "ORDER_PENDING",
          `Minting ***** ${selectedToken} tokens to wallet`
        )

        // Update token balance immediately after minting
        setMockUsdcBalance((prev) => prev - usdcAmount)

        // Log the token addition
        setTimeout(() => {
          addTradeLog(
            "ORDER_PENDING",
            `${estimatedTokenAmount.toFixed(4)} ${selectedToken} tokens minted to wallet`
          )
        }, 1000)
      }, 30000)

      // Step 12: Final completion
      setTimeout(() => {
        addTradeLog(
          "ORDER_FILLED",
          `Order completed: ***** ${selectedToken} tokens delivered`,
          {
            amount: "*****",
            token: selectedToken,
          }
        )

        // Clear the input (balances already updated during the process)
        setBuyUsdc("")

        // Success confirmation with visible balance update
        setTimeout(() => {
          addTradeLog(
            "ORDER_FILLED",
            `Balance updated: +${estimatedTokenAmount.toFixed(4)} ${selectedToken} tokens`
          )
        }, 3000)
      }, 34000)
    } catch (err) {
      addTradeLog(
        "ORDER_FAILED",
        `Order failed: ${err instanceof Error ? err.message : "Unknown error"}`
      )
      console.error("Error in handleBuy:", err)
    }
  }
  const handleSell = () => {
    if (!sellToken) return

    addTradeLog(
      "ORDER_SUBMITTED",
      `Sell order submitted: ***** ${selectedToken} → USDC`,
      {
        amount: "*****",
        token: selectedToken,
      }
    )

    // Use Orders contract: sellAsset(adfsFeedId, ticker, token, tokenAmount)
    // You may need to determine the correct adfsFeedId for your asset
    const tokenAmount = BigInt(Math.floor(Number(sellToken) * 1e6)) // Assuming 6 decimals
    sellAsset(
      BigInt(1), // adfsFeedId (replace with actual feed ID as needed)
      selectedToken,
      rwaTokenAddress,
      tokenAmount
    )
  }

  // LogEntry component following the pattern from LogBar
  const LogEntry = ({
    time,
    type,
    message,
  }: {
    time: string
    type: LogType
    message: string
  }) => {
    const getLogColor = (logType: LogType) => {
      switch (logType) {
        case "ORDER_FILLED":
          return "text-green-600 bg-green-50 border-green-200"
        case "ORDER_SUBMITTED":
          return "text-blue-600 bg-blue-50 border-blue-200"
        case "ORDER_PENDING":
          return "text-orange-600 bg-orange-50 border-orange-200"
        case "ORDER_FAILED":
          return "text-red-600 bg-red-50 border-red-200"
        case "APPROVAL_SUCCESS":
          return "text-emerald-600 bg-emerald-50 border-emerald-200"
        case "ENCRYPTION_SUCCESS":
          return "text-purple-600 bg-purple-50 border-purple-200"
        default:
          return "text-slate-600 bg-slate-50 border-slate-200"
      }
    }

    const getLogIcon = (logType: LogType) => {
      switch (logType) {
        case "ORDER_FILLED":
          return "✅"
        case "ORDER_SUBMITTED":
          return "📤"
        case "ORDER_PENDING":
          return "⏳"
        case "ORDER_FAILED":
          return "❌"
        case "APPROVAL_SUCCESS":
          return "🔐"
        case "ENCRYPTION_SUCCESS":
          return "🔒"
        default:
          return "📝"
      }
    }

    return (
      <div
        className={`p-3 rounded-lg border transition-colors hover:shadow-sm ${getLogColor(type)}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <span className="text-sm">{getLogIcon(type)}</span>
            <div>
              <p className="text-sm font-medium leading-tight">{message}</p>
              <p className="text-xs opacity-70 mt-1">{time}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shrink-0 ml-2">
            {type.replace("_", " ")}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 md:px-0">
      {/* Header Section */}
      <div
        className="bg-gradient-to-br rounded-3xl p-8 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(120deg, #7F1DFF 0%, #4F46E5 60%, #0EA5E9 100%)",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,255,255,0.08),transparent_70%)]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Badge
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/20"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Live Trading
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-3">Token Trading</h1>
          <p className="text-purple-100 text-lg mb-6 max-w-2xl">
            Trade between supported tokens and USDC instantly with
            industry-leading low fees and lightning-fast execution.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-sm">Instant Settlement</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-300" />
              <span className="text-sm">Secure Trading</span>
            </div>
          </div>
        </div>
      </div>

      {/* Token Selector */}
      <div className="flex justify-center gap-4 mt-4">
        {TOKENS.map((token) => (
          <Button
            key={token.value}
            variant={selectedToken === token.value ? "default" : "outline"}
            onClick={() => setSelectedToken(token.value)}
            className="min-w-[80px]"
          >
            {token.label}
          </Button>
        ))}
      </div>

      {/* Chart Section */}
      <div className="mb-8">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center bg-slate-50 rounded-xl">
            <div className="text-center">
              <RefreshCcw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <StockChart data={tokenData} ticker={selectedToken} />
        )}
      </div>
      {/* Trading Section */}
      <div className="flex justify-center items-center min-h-[60vh]">
        {/* Main Trading Interface */}
        <div className="w-full max-w-xl">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="pb-4">
              {/* Buy/Sell Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {tradeType === "buy" ? (
                    <ArrowDownCircle className="text-emerald-500 w-6 h-6" />
                  ) : (
                    <ArrowUpCircle className="text-blue-500 w-6 h-6" />
                  )}
                  <div>
                    <CardTitle className="text-xl">
                      {tradeType === "buy" ? "Buy" : "Sell"} S{selectedToken}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {tradeType === "buy"
                        ? `Deposit USDC to receive S${selectedToken}`
                        : `Sell S${selectedToken} for USDC`}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">
                    {tradeType === "buy"
                      ? "USDC Balance"
                      : `S${selectedToken} Balance`}
                  </div>
                  <div
                    className={`font-bold text-base ${
                      tradeType === "buy" ? "text-emerald-700" : "text-blue-700"
                    }`}
                  >
                    {tradeType === "buy"
                      ? usdcLoading
                        ? "Loading..."
                        : usdcError
                          ? "-"
                          : `${usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} USDC`
                      : balanceLoading
                        ? "Loading..."
                        : `${tokenBalance.toLocaleString()} S${selectedToken}`}
                  </div>
                  {/* Show secondary balance */}
                  <div className="text-xs text-slate-400 mt-1">
                    {tradeType === "buy"
                      ? balanceLoading
                        ? "Loading..."
                        : `${tokenBalance.toLocaleString()} S${selectedToken}`
                      : usdcLoading
                        ? "Loading..."
                        : usdcError
                          ? "-"
                          : `${usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} USDC`}
                  </div>
                </div>
              </div>

              {/* Toggle Buttons */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <Button
                  variant={tradeType === "buy" ? "success" : "ghost"}
                  onClick={() => setTradeType("buy")}
                  className="flex-1"
                >
                  <ArrowDownCircle className="w-4 h-4 mr-2" />
                  Buy
                </Button>
                <Button
                  variant={tradeType === "sell" ? "default" : "ghost"}
                  onClick={() => setTradeType("sell")}
                  className={`flex-1 ${tradeType === "sell" ? "bg-blue-500 hover:bg-blue-600 text-white" : "text-slate-600"}`}
                >
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Sell
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Market Info Bar */}
              <div className="mb-6 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Current Price</p>
                      <p className="font-bold text-lg">
                        ${latestPrice.toFixed(2)}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        priceChangePercent >= 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <TrendingUp
                        className={`w-3 h-3 ${priceChangePercent < 0 ? "rotate-180" : ""}`}
                      />
                      {priceChangePercent >= 0 ? "+" : ""}
                      {priceChangePercent.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">24h Change</p>
                    <p
                      className={`font-semibold ${priceChangePercent >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      ${priceChange >= 0 ? "+" : ""}
                      {priceChange.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {tradeType === "buy" ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm text-slate-600 mb-2">
                      USDC Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={buyUsdc}
                      onChange={(e) => setBuyUsdc(e.target.value)}
                      placeholder="Enter USDC amount"
                      className="border border-emerald-200 focus:border-emerald-400 rounded-lg px-4 py-3 w-full bg-white shadow-sm focus:outline-none transition text-lg"
                    />
                  </div>

                  {buyUsdc && latestPrice > 0 && (
                    <div className="mb-4 space-y-3">
                      {/* Estimation Summary */}
                      <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                        <div className="text-sm text-emerald-700 mb-3 font-medium">
                          Transaction Summary
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">You pay:</span>
                            <span className="font-semibold">
                              {buyUsdc} USDC
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              Trading fee (0.25%):
                            </span>
                            <span className="font-semibold text-orange-600">
                              -{buyFeeUsdc} USDC
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              You receive (est.):
                            </span>
                            <span className="font-bold text-emerald-700">
                              {netReceiveTokens} S{selectedToken}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Rate:</span>
                            <span className="font-semibold">
                              1 S{selectedToken} = ${latestPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Risk & Slippage Info */}
                      <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="text-xs text-orange-700 space-y-1">
                          <div className="flex justify-between">
                            <span>Max slippage (1%):</span>
                            <span className="font-semibold">
                              {(parseFloat(netReceiveTokens) * 0.99).toFixed(4)}{" "}
                              S{selectedToken}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Network fee:</span>
                            <span className="font-semibold">
                              ~$2.50 (estimated)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Settlement time:</span>
                            <span className="font-semibold">~15 seconds</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full mt-4 font-semibold text-lg py-3"
                    variant="success"
                    onClick={handleBuy}
                    isDisabled={!buyUsdc || isApprovePending || isOrderPending}
                  >
                    {isApprovePending || isOrderPending
                      ? "Processing..."
                      : `Buy S${selectedToken}`}
                  </Button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm text-slate-600 mb-2">
                      S{selectedToken} Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sellToken}
                      onChange={(e) => setSellToken(e.target.value)}
                      placeholder={`Enter S${selectedToken} amount`}
                      className="border border-blue-200 focus:border-blue-400 rounded-lg px-4 py-3 w-full bg-white shadow-sm focus:outline-none transition text-lg"
                    />
                  </div>

                  {sellToken && latestPrice > 0 && (
                    <div className="mb-4 space-y-3">
                      {/* Estimation Summary */}
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="text-sm text-blue-700 mb-3 font-medium">
                          Transaction Summary
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">You sell:</span>
                            <span className="font-semibold">
                              {sellToken} S{selectedToken}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              Gross amount:
                            </span>
                            <span className="font-semibold">
                              {estimatedUsdc} USDC
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              Trading fee (0.25%):
                            </span>
                            <span className="font-semibold text-orange-600">
                              -{sellFeeUsdc} USDC
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              You receive (net):
                            </span>
                            <span className="font-bold text-blue-700">
                              {netReceiveUsdc} USDC
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Rate:</span>
                            <span className="font-semibold">
                              1 S{selectedToken} = ${latestPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Risk & Slippage Info */}
                      <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="text-xs text-orange-700 space-y-1">
                          <div className="flex justify-between">
                            <span>Min slippage (1%):</span>
                            <span className="font-semibold">
                              {(parseFloat(netReceiveUsdc) * 0.99).toFixed(2)}{" "}
                              USDC
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Network fee:</span>
                            <span className="font-semibold">
                              ~$2.50 (estimated)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Settlement time:</span>
                            <span className="font-semibold">~15 seconds</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full mt-4 font-semibold text-lg py-3 bg-blue-500 hover:bg-blue-600"
                    onClick={handleSell}
                    isDisabled={!sellToken}
                  >
                    Sell S{selectedToken}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Page
