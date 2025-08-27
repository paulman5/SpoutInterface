import { NextRequest } from "next/server";

// Check for required environment variables
if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_SECRET_KEY) {
  console.error("Missing required Alpaca API environment variables");
}

const ALPACA_API_KEY = process.env.APCA_API_KEY_ID ?? "";
const ALPACA_API_SECRET = process.env.APCA_API_SECRET_KEY ?? "";
const DATA_URL = "https://data.alpaca.markets";

// Log environment variable status on startup
console.log("API Configuration Status:", {
  hasApiKey: !!ALPACA_API_KEY,
  hasApiSecret: !!ALPACA_API_SECRET,
  dataUrl: DATA_URL,
});

interface AlpacaQuote {
  ap: number; // ask price
  as: number; // ask size
  bp: number; // bid price
  bs: number; // bid size
  t: string; // timestamp
}

interface AlpacaResponse {
  [symbol: string]: AlpacaQuote[];
}

// Generate mock data for fallback
function generateMockData(ticker: string) {
  const basePrice =
    {
      SUSC: 108.5, // Spout US Corporate Bond Token
      LQD: 107.25, // iShares iBoxx $ Investment Grade Corporate Bond ETF
    }[ticker] || 100.0;

  const data = [];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90); // Get last 90 days

  // Generate data for each day in the range
  for (
    let date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Calculate days from start for trend
    const daysSinceStart = Math.floor(
      (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Create a slight upward trend with some random variation
    const dayFactor = 1 + daysSinceStart * 0.0002; // Small daily increase
    const randomFactor = 0.997 + Math.random() * 0.006; // ±0.3% random variation
    const price = basePrice * dayFactor * randomFactor;

    // Add small intraday variation
    const variance = price * 0.001; // 0.1% intraday variance
    const open = price + (Math.random() - 0.5) * variance;
    const close = price + (Math.random() - 0.5) * variance;
    const high = Math.max(open, close) + Math.random() * variance * 0.5;
    const low = Math.min(open, close) - Math.random() * variance * 0.5;

    // Volume between 100K-300K for bonds
    const volume = Math.floor(100000 + Math.random() * 200000);

    // Format the date as YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0];

    data.push({
      time: formattedDate,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
      quote: {
        t: new Date(date).toISOString(),
        ap: Math.round((close + variance * 0.5) * 100) / 100,
        bp: Math.round((close - variance * 0.5) * 100) / 100,
        as: Math.floor(volume / 2),
        bs: Math.floor(volume / 2),
      },
    });
  }

  return data;
}

async function fetchHistoricalData(
  ticker: string,
  retryCount = 0,
): Promise<any[]> {
  try {
    // Calculate start and end dates: last 90 days, ending yesterday
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1); // yesterday
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 89);
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    console.log("Date range:", {
      start: startStr,
      end: endStr,
      now: new Date().toISOString(),
    });

    let allAuctions: any[] = [];
    let nextPageToken: string | null = null;
    let seenTokens = new Set<string>();
    let pageCount = 0;
    const MAX_PAGES = 10;

    while (pageCount < MAX_PAGES) {
      let url = `${DATA_URL}/v2/stocks/${ticker}/auctions?start=${startStr}&end=${endStr}&limit=10000`;
      if (nextPageToken) {
        url += `&page_token=${nextPageToken}`;
      }

      console.log("Fetching auctions page:", {
        pageCount,
        url,
        nextPageToken,
      });

      const response = await fetch(url, {
        headers: {
          "APCA-API-KEY-ID": ALPACA_API_KEY,
          "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
        },
      });

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status}: ${await response.text()}`,
        );
      }

      const data = await response.json();

      // Check if we have valid auctions data
      if (
        !data.auctions ||
        !Array.isArray(data.auctions) ||
        data.auctions.length === 0
      ) {
        console.log("No more auctions available, stopping pagination");
        break;
      }

      allAuctions = allAuctions.concat(data.auctions);

      if (!data.next_page_token) {
        console.log("No next page token, finished fetching");
        break;
      }

      if (seenTokens.has(data.next_page_token)) {
        console.log("Duplicate page token detected, stopping pagination");
        break;
      }

      nextPageToken = data.next_page_token;
      if (nextPageToken) {
        seenTokens.add(nextPageToken);
      }
      pageCount++;
    }

    console.log("Finished fetching auctions:", {
      totalAuctions: allAuctions.length,
      totalPages: pageCount,
    });

    if (allAuctions.length === 0) {
      console.log("No auctions found for the specified date range");
      return [];
    }

    // Process auctions: for each day, use the 'p' value from the closing auction (auction.c)
    const dailyData = new Map();
    for (const auction of allAuctions) {
      const date = auction.d;
      if (!auction.c || !Array.isArray(auction.c) || auction.c.length === 0)
        continue;
      // Use the last closing auction's 'p' value for the day
      const lastClose = auction.c[auction.c.length - 1];
      if (!lastClose || typeof lastClose.p !== "number") continue;
      const price = lastClose.p;
      const volume = lastClose.s || 0;
      dailyData.set(date, {
        time: date,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: volume,
      });
    }

    // Convert to array and sort by date
    const result = Array.from(dailyData.values()).sort((a, b) =>
      a.time.localeCompare(b.time),
    );

    console.log("Processed daily data for chart:", {
      days: result.length,
      firstDay: result[0]?.time,
      lastDay: result[result.length - 1]?.time,
      sampleData: result[0],
    });

    return result;
  } catch (error: any) {
    console.error("Error fetching historical data for " + ticker + ":", error);

    if (retryCount < 3) {
      console.log("Waiting 2 seconds before retry...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return fetchHistoricalData(ticker, retryCount + 1);
    }

    throw new Error(`Error fetching historical data: ${error.message}`);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  try {
    console.log("API Configuration Status:", {
      hasApiKey: !!ALPACA_API_KEY,
      hasApiSecret: !!ALPACA_API_SECRET,
      dataUrl: DATA_URL,
    });

    // Get the ticker from the URL params
    const { ticker } = await params;

    // Validate ticker
    if (!ticker || typeof ticker !== "string") {
      return new Response(
        JSON.stringify({
          error: "Invalid ticker symbol",
        }),
        { status: 400 },
      );
    }

    const historicalData = await fetchHistoricalData(ticker);

    if (!historicalData || historicalData.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No historical data available",
        }),
        { status: 404 },
      );
    }

    // Get the latest and previous quotes
    const latestQuote = historicalData[historicalData.length - 1];
    const prevQuote = historicalData[historicalData.length - 2] || latestQuote;

    // Calculate price changes
    const currentPrice = latestQuote.c;
    const priceChange = currentPrice - prevQuote.c;
    const priceChangePercent = (priceChange / prevQuote.c) * 100;

    return new Response(
      JSON.stringify({
        symbol: ticker,
        currentPrice,
        priceChange,
        priceChangePercent,
        data: historicalData,
        dataSource: "real",
      }),
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch stock data",
      }),
      { status: 500 },
    );
  }
}
