import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

export default function TradeHeader() {
  return (
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
      </div>
    </div>
  );
}
