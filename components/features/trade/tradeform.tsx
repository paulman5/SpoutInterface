import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Shield } from "lucide-react"
import React from "react"
import { useOnchainID } from "@/hooks/view/onChain/useOnchainID"
import { useContractAddress } from "@/lib/addresses"
import { useAccount } from "wagmi"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LoadingSpinner } from "@/components/loadingSpinner"

type TradeFormProps = {
  tradeType: "buy" | "sell"
  setTradeType: (type: "buy" | "sell") => void
  selectedToken: string
  buyUsdc: string
  setBuyUsdc: (v: string) => void
  sellToken: string
  setSellToken: (v: string) => void
  latestPrice: number | null
  priceLoading: boolean
  usdcBalance: number
  tokenBalance: number
  usdcLoading: boolean
  usdcError: boolean
  balanceLoading: boolean
  isApprovePending: boolean
  isOrderPending: boolean
  handleBuy: () => void
  handleSell: () => void
  buyFeeUsdc: string
  netReceiveTokens: string
  sellFeeUsdc: string
  netReceiveUsdc: string
  priceChangePercent: number
  priceChange: number
}

export default function TradeForm({
  tradeType,
  setTradeType,
  selectedToken,
  buyUsdc,
  setBuyUsdc,
  sellToken,
  setSellToken,
  latestPrice,
  priceLoading,
  usdcBalance,
  tokenBalance,
  usdcLoading,
  usdcError,
  balanceLoading,
  isApprovePending,
  isOrderPending,
  handleBuy,
  handleSell,
  buyFeeUsdc,
  netReceiveTokens,
  sellFeeUsdc,
  netReceiveUsdc,
  priceChangePercent,
  priceChange,
}: TradeFormProps) {
  const { address: userAddress } = useAccount()
  const idFactoryAddress = useContractAddress("idfactory")
  const issuerAddress = useContractAddress("issuer")

  const { hasKYCClaim, kycLoading } = useOnchainID({
    userAddress,
    idFactoryAddress,
    issuer: issuerAddress || "",
    topic: 1,
  })

  // Determine if buy button should be disabled
  const isBuyDisabled = !buyUsdc || isApprovePending || isOrderPending || !hasKYCClaim || kycLoading

  return (
    <div className="w-full max-w-xl mx-auto">
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
              className={`flex-1 transition-all duration-200 ${
                tradeType === "buy" 
                  ? "shadow-lg transform scale-[0.98] ring-2 ring-emerald-200" 
                  : "hover:scale-[1.02]"
              }`}
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Buy
            </Button>
            {/* Temporarily disabled sell tab */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1 py-2 px-4 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center">
                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                    Sell
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Selling SLQD tokens is temporarily unavailable</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Market Info Bar */}
          <div className="mb-6 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-slate-500">Current Price</p>
                  {priceLoading || !latestPrice || latestPrice === 0 ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner />
                      <span className="text-slate-400">Loading...</span>
                    </div>
                  ) : (
                    <p className="font-bold text-lg">${latestPrice.toFixed(2)}</p>
                  )}
                </div>
                {!priceLoading && latestPrice && latestPrice > 0 && (
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
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">24h Change</p>
                {priceLoading || !latestPrice || latestPrice === 0 ? (
                  <p className="text-slate-400 text-sm">--</p>
                ) : (
                  <p
                    className={`font-semibold ${
                      priceChangePercent >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    ${priceChange >= 0 ? "+" : ""}
                    {priceChange.toFixed(2)}
                  </p>
                )}
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
                  type="text"
                  value={buyUsdc}
                  onChange={(e) => setBuyUsdc(e.target.value)}
                  placeholder="Enter USDC amount"
                  className="border border-emerald-200 focus:border-emerald-400 rounded-lg px-4 py-3 w-full bg-white shadow-sm focus:outline-none transition text-lg"
                />
              </div>

              {buyUsdc && latestPrice && latestPrice > 0 && (
                <div className="mb-4 space-y-3">
                  {/* Estimation Summary */}
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="text-sm text-emerald-700 mb-3 font-medium">
                      Transaction Summary
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">You pay:</span>
                        <span className="font-semibold">{buyUsdc} USDC</span>
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
                          {(parseFloat(netReceiveTokens) * 0.99).toFixed(4)} S
                          {selectedToken}
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

              {/* Verification Warning */}
              {!hasKYCClaim && !kycLoading && (
                <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Verification Required
                    </span>
                  </div>
                  <p className="text-xs text-amber-700">
                    You need to complete verification before you can buy tokens. 
                    Please complete the verification process in your profile.
                  </p>
                </div>
              )}

              <Button
                className="w-full mt-4 font-semibold text-lg py-3"
                variant="success"
                onClick={handleBuy}
                isDisabled={isBuyDisabled}
              >
                {isApprovePending || isOrderPending ? (
                  <>
                    <LoadingSpinner />
                    {isApprovePending ? "Approving..." : "Processing..."}
                  </>
                ) : !hasKYCClaim && !kycLoading ? (
                  "KYC Required"
                ) : (
                  `Buy S${selectedToken}`
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm text-slate-600 mb-2">
                  S{selectedToken} Amount
                </label>
                <input
                  type="text"
                  value={sellToken}
                  onChange={(e) => setSellToken(e.target.value)}
                  placeholder={`Enter S${selectedToken} amount`}
                  className="border border-blue-200 focus:border-blue-400 rounded-lg px-4 py-3 w-full bg-white shadow-sm focus:outline-none transition text-lg"
                />
              </div>

              {sellToken && latestPrice && latestPrice > 0 && (
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
                        <span className="text-slate-600">Gross amount:</span>
                        <span className="font-semibold">
                          {netReceiveUsdc} USDC
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
                          {(parseFloat(netReceiveUsdc) * 0.99).toFixed(2)} USDC
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

              {/* Temporarily disabled sell button for testnet */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full mt-4 font-semibold text-lg py-3 bg-gray-400 text-gray-600 cursor-not-allowed opacity-50 rounded-lg flex items-center justify-center">
                      Sell S{selectedToken}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Selling SLQD tokens is temporarily unavailable</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
