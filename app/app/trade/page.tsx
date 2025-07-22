"use client"
import React, { useEffect, useState } from "react"
import TradeHeader from "@/components/features/trade/tradeheader"
import TradeTokenSelector from "@/components/features/trade/tradetokenselector"
import TradeChart from "@/components/features/trade/tradechart"
import TradeForm from "@/components/features/trade/tradeform"
import { useAccount, useConfig } from "wagmi"
import { useERC20Approve } from "@/hooks/writes/onChain/useERC20Approve"
import { useOrdersContract } from "@/hooks/writes/onChain/useOrders"
import { waitForTransactionReceipt } from "wagmi/actions"
import { useTokenBalance } from "@/hooks/view/onChain/useTokenBalance"
import { useUSDCTokenBalance } from "@/hooks/view/onChain/useUSDCTokenBalance"
import { useContractAddress } from "@/lib/addresses"

const TOKENS = [{ label: "LQD", value: "LQD" }]

const TradePage = () => {
  const [selectedToken, setSelectedToken] = useState("LQD")
  const [tokenData, setTokenData] = useState<any[]>([])
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [buyUsdc, setBuyUsdc] = useState("")
  const [sellToken, setSellToken] = useState("")
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [chartDataSource, setChartDataSource] = useState<"real" | "mock">(
    "real"
  )
  const [etfData, setEtfData] = useState<any>(null)

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

  useEffect(() => {
    async function fetchETFData() {
      try {
        const response = await fetch(`/api/stocks/${selectedToken}`)
        const data = await response.json()
        setEtfData(data)
      } catch (error) {}
    }
    fetchETFData()
  }, [selectedToken])

  function generateMockData(ticker: string) {
    const basePrice = { SLQD: 108.5 }[ticker] || 150.0
    const data = []
    const today = new Date()
    for (let i = 99; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      if (date.getDay() === 0 || date.getDay() === 6) continue
      const randomFactor = 0.95 + Math.random() * 0.1
      const price = basePrice * randomFactor
      const variance = price * 0.02
      const open = price + (Math.random() - 0.5) * variance
      const close = price + (Math.random() - 0.5) * variance
      const high = Math.max(open, close) + Math.random() * variance * 0.5
      const low = Math.min(open, close) - Math.random() * variance * 0.5
      const volume = Math.floor(50000000 + Math.random() * 100000000)
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

  useEffect(() => {
    async function fetchChartData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/stocks/${selectedToken}`)
        const json = await res.json()
        if (json.error) {
          const mockData = generateMockData(selectedToken)
          setTokenData(mockData)
          setChartDataSource("mock")
        } else {
          setTokenData(json.data || [])
          setChartDataSource(json.dataSource)
        }
      } catch (e) {
        const mockData = generateMockData(selectedToken)
        setTokenData(mockData)
        setChartDataSource("mock")
      } finally {
        setLoading(false)
      }
    }
    fetchChartData()
  }, [selectedToken])

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
          setCurrentPrice(108.5)
        }
      } catch (e) {
        if (isMounted) {
          setCurrentPrice(108.5)
        }
      }
    }
    fetchPriceData()
    const interval = setInterval(fetchPriceData, 5000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [selectedToken])

  const latestPrice =
    currentPrice ||
    (tokenData.length > 0 ? tokenData[tokenData.length - 1].close : 108.5)
  const prevPrice =
    tokenData.length > 1 ? tokenData[tokenData.length - 2].close : latestPrice
  const priceChange = latestPrice - prevPrice
  const priceChangePercent = prevPrice > 0 ? (priceChange / prevPrice) * 100 : 0

  const tradingFee = 0.0025
  const estimatedTokens =
    buyUsdc && latestPrice ? (parseFloat(buyUsdc) / latestPrice).toFixed(4) : ""
  const estimatedUsdc =
    sellToken && latestPrice
      ? (parseFloat(sellToken) * latestPrice).toFixed(2)
      : ""
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

  const handleBuy = async () => {
    if (!userAddress || !buyUsdc) return
    const amount = BigInt(Math.floor(Number(buyUsdc) * 1e6))
    const usdcAmount = parseFloat(buyUsdc)
    const estimatedTokenAmount = latestPrice > 0 ? usdcAmount / latestPrice : 0
    try {
      const approveTx = await approve(ordersAddress, amount)
      await waitForTransactionReceipt(config, { hash: approveTx })
      buyAsset(BigInt(2000002), selectedToken, rwaTokenAddress, amount)
      setBuyUsdc("")
    } catch (err) {
      console.error(
        `Order failed: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    }
  }
  const handleSell = () => {
    if (!sellToken) return
    const tokenAmount = BigInt(Math.floor(Number(sellToken) * 1e6))
    sellAsset(BigInt(1), selectedToken, rwaTokenAddress, tokenAmount)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 md:px-0">
      <TradeHeader />
      <TradeTokenSelector
        tokens={TOKENS}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
      />
      <TradeChart
        loading={loading}
        tokenData={tokenData}
        selectedToken={selectedToken}
      />
      <TradeForm
        tradeType={tradeType}
        setTradeType={setTradeType}
        selectedToken={selectedToken}
        buyUsdc={buyUsdc}
        setBuyUsdc={setBuyUsdc}
        sellToken={sellToken}
        setSellToken={setSellToken}
        latestPrice={latestPrice}
        usdcBalance={usdcBalance}
        tokenBalance={tokenBalance}
        usdcLoading={usdcLoading}
        usdcError={usdcError}
        balanceLoading={balanceLoading}
        isApprovePending={isApprovePending}
        isOrderPending={isOrderPending}
        handleBuy={handleBuy}
        handleSell={handleSell}
        buyFeeUsdc={buyFeeUsdc}
        netReceiveTokens={netReceiveTokens}
        sellFeeUsdc={sellFeeUsdc}
        netReceiveUsdc={netReceiveUsdc}
        priceChangePercent={priceChangePercent}
        priceChange={priceChange}
      />
    </div>
  )
}

export default TradePage
