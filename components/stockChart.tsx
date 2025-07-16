"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface StockData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface StockChartProps {
  data: StockData[]
  ticker: string
  height?: number
}

export default function StockChart({
  data,
  ticker,
  height = 400,
}: StockChartProps) {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartType, setChartType] = React.useState("price")

  console.log("StockChart received data:", data?.length, "points for", ticker)

  // Filter data based on time range - moved before early return
  const filteredData = React.useMemo(() => {
    if (!data || !data.length) return []

    let daysToShow = 90
    if (timeRange === "30d") daysToShow = 30
    else if (timeRange === "7d") daysToShow = 7

    return data.slice(-daysToShow).map((item) => ({
      ...item,
      date: item.time,
      price: item.close,
      volumeFormatted: (item.volume / 1000000).toFixed(1) + "M",
    }))
  }, [data, timeRange])

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading {ticker} chart...</p>
        </div>
      </div>
    )
  }

  const formatPrice = (value: number) => `$${value.toFixed(2)}`
  const formatVolume = (value: number) => `${(value / 1000000).toFixed(1)}M`

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.dataKey === "price"
                ? formatPrice(entry.value)
                : formatVolume(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-1">
          <div className="mb-1">
            <CardTitle>{ticker} Stock Chart</CardTitle>
            <CardDescription>
              Interactive stock price and volume chart
            </CardDescription>
          </div>
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex gap-2">
              <Button
                variant={timeRange === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("7d")}
              >
                7D
              </Button>
              <Button
                variant={timeRange === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("30d")}
              >
                30D
              </Button>
              <Button
                variant={timeRange === "90d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("90d")}
              >
                90D
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={chartType === "price" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("price")}
              >
                Price
              </Button>
              <Button
                variant={chartType === "volume" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("volume")}
              >
                Volume
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              tickFormatter={chartType === "price" ? formatPrice : formatVolume}
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={chartType === "price" ? "price" : "volume"}
              stroke={chartType === "price" ? "#3b82f6" : "#10b981"}
              strokeWidth={2}
              fill={
                chartType === "price" ? "url(#colorPrice)" : "url(#colorVolume)"
              }
              name={chartType === "price" ? "Price" : "Volume"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
