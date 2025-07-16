import { NextResponse } from "next/server"

interface AlpacaQuote {
  t: string
  ap: number
  bp: number
}

interface AlpacaBar {
  c: number
  t: string
}

interface AlpacaBarsResponse {
  bars: {
    [symbol: string]: AlpacaBar[]
  }
}

function calculateMidPrice(quote: AlpacaQuote): number {
  if (quote.ap > 0 && quote.bp > 0) return (quote.ap + quote.bp) / 2
  if (quote.ap > 0) return quote.ap
  if (quote.bp > 0) return quote.bp
  return 0
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol") || "LQD"

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID ?? "",
      "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY ?? "",
    },
  }

  try {
    // Step 1: Get latest quote for fallback price
    const latestUrl = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${symbol}`
    const latestRes = await fetch(latestUrl, options)
    const latestData = (await latestRes.json()) as {
      quotes: { [symbol: string]: AlpacaQuote }
    }
    const latestQuote = latestData.quotes?.[symbol]
    const latestDate = new Date(latestQuote?.t ?? Date.now())
    const midPrice = latestQuote ? calculateMidPrice(latestQuote) : null

    // Step 2: Get the most recent 10 bars
    const barsUrl = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=1Day&limit=10`
    const barsRes = await fetch(barsUrl, options)
    const barsData = (await barsRes.json()) as AlpacaBarsResponse
    const bars = barsData.bars?.[symbol] ?? []

    const sortedBars = bars
      .filter((b) => typeof b?.c === "number")
      .sort((a, b) => new Date(b.t).getTime() - new Date(a.t).getTime())

    console.log("✅ Sorted Bars:", sortedBars)

    const currentBar = sortedBars[0] ?? null
    const previousBar = sortedBars[1] ?? null

    const response = {
      symbol,
      price: currentBar?.c ?? midPrice ?? null,
      previousClose: previousBar?.c ?? midPrice ?? null,
      timestamp: currentBar?.t ?? latestQuote?.t ?? null,
      yield: 4.95, // LQD's current yield is around 4.95% as of Feb 2024
      fallbackUsed: previousBar == null,
      dates: {
        current: currentBar?.t ?? null,
        previous: previousBar?.t ?? null,
        quote: latestQuote?.t ?? null,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Error fetching market data:", error)
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    )
  }
}
