import StockChart from "@/components/stockChart"
import { RefreshCcw } from "lucide-react"

type TradeChartProps = {
  loading: boolean
  tokenData: any[]
  selectedToken: string
}

export default function TradeChart({
  loading,
  tokenData,
  selectedToken,
}: TradeChartProps) {
  return (
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
  )
}
