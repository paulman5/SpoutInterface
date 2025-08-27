import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

type PortfolioHeaderProps = {
  username?: string;
  portfolioValue: number;
  dayChange: number;
  dayChangePercent: number;
  onRefresh: () => void;
};

export default function PortfolioHeader({
  username,
  portfolioValue,
  dayChange,
  dayChangePercent,
  onRefresh,
}: PortfolioHeaderProps) {
  // Format number to 3 decimals, matching holdings value
  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };
  const formatPercent = (num: number) => Number(num.toFixed(2));
  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="inline-flex items-center space-x-2">
              <Badge variant="outline" className="text-white border-white/20">
                Live Portfolio
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white/80"
                aria-label="Refresh"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
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
  );
}
