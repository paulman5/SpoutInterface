import { NextResponse } from "next/server";

interface AlpacaQuote {
  t: string;
  ap: number;
  bp: number;
}

interface AlpacaBar {
  c: number;
  t: string;
}

interface AlpacaBarsResponse {
  bars: {
    [symbol: string]: AlpacaBar[];
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "LQD";

  console.log("🔍 Requested symbol:", symbol);

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "APCA-API-KEY-ID": process.env.APCA_API_KEY_ID ?? "",
      "APCA-API-SECRET-KEY": process.env.APCA_API_SECRET_KEY ?? "",
    },
  };

  try {
    // Step 1: Get latest quote for fallback price
    const latestUrl = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${symbol}`;
    console.log("📡 Fetching quote from:", latestUrl);
    const latestRes = await fetch(latestUrl, options);
    const latestData = (await latestRes.json()) as {
      quotes: { [symbol: string]: AlpacaQuote };
    };
    console.log("📊 Quote response:", latestData);

    const latestQuote = latestData.quotes?.[symbol];
    const askPrice = latestQuote?.ap ?? null;
    const bidPrice = latestQuote?.bp ?? null;

    console.log("💰 Ask/Bid prices:", { askPrice, bidPrice });

    // Step 2: Get the most recent 10 bars
    const barsUrl = `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=1Day&limit=10`;
    console.log("📡 Fetching bars from:", barsUrl);
    const barsRes = await fetch(barsUrl, options);
    const barsData = (await barsRes.json()) as AlpacaBarsResponse;
    console.log("📊 Bars response:", barsData);

    const bars = barsData.bars?.[symbol] ?? [];

    const sortedBars = bars
      .filter((b) => typeof b?.c === "number")
      .sort((a, b) => new Date(b.t).getTime() - new Date(a.t).getTime());

    console.log("✅ Sorted Bars:", sortedBars);

    const currentBar = sortedBars[0] ?? null;
    const previousBar = sortedBars[1] ?? null;

    // Helper to choose first valid positive number
    const firstValid = (...vals: Array<number | null | undefined>) =>
      vals.find((v) => typeof v === "number" && isFinite(v) && v > 0) ?? null;

    // Robust fallbacks
    const resolvedPrice = firstValid(
      currentBar?.c,
      askPrice,
      bidPrice,
      previousBar?.c,
    );
    const resolvedPreviousClose = firstValid(
      previousBar?.c,
      currentBar?.c,
      bidPrice,
      askPrice,
    );

    // Step 3: Fetch actual yield data
    let actualYield = 4.95; // Fallback value
    try {
      const yieldUrl = `${request.headers.get("origin") || "http://localhost:3000"}/api/marketdata/yields?symbol=${symbol}`;
      console.log("📡 Fetching yield from:", yieldUrl);
      const yieldRes = await fetch(yieldUrl);
      if (yieldRes.ok) {
        const yieldData = await yieldRes.json();
        actualYield = yieldData.yield || 4.44;
        console.log("📊 Actual yield from API:", actualYield);
      } else {
        console.log("⚠️ Failed to fetch yield, using fallback");
      }
    } catch (yieldError) {
      console.log("⚠️ Error fetching yield, using fallback:", yieldError);
    }

    const response = {
      symbol,
      price: resolvedPrice,
      askPrice: askPrice,
      bidPrice: bidPrice,
      previousClose: resolvedPreviousClose,
      timestamp: currentBar?.t ?? latestQuote?.t ?? null,
      yield: actualYield, // Use actual yield from API
      fallbackUsed: previousBar == null || !resolvedPrice,
      dates: {
        current: currentBar?.t ?? null,
        previous: previousBar?.t ?? null,
        quote: latestQuote?.t ?? null,
      },
    };

    console.log("🎯 Final response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error fetching market data:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 },
    );
  }
}
