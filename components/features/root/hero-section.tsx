"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { useScreenSize } from "@/hooks/use-screen-size"
import { JoinMailingList } from "./join-mailing-list"
import { PartnerTicker } from "./partner-ticker"

export function HeroSection() {
  const screenSize = useScreenSize()

  return (
    <section className="w-full flex flex-col items-center justify-center relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <PixelTrail
          fadeDuration={1200}
          delay={300}
          pixelClassName="rounded-2xl bg-emerald-600/15"
          pixelSize={screenSize.lessThan("md") ? 40 : 60}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="text-center mb-16 w-full">
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-2 text-sm font-medium bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-200"
          >
            <Zap className="w-4 h-4 mr-2" />
            Live Trading Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
            Spout Finance
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-12 font-light leading-relaxed break-words text-center w-full">
            Unlock the power of TradFi with DeFi. Verify, Buy and integrate
            TradFi assets into your DeFi playbook and track your portfolio
            through our on-chain analytics dashboard.
          </p>
        </div>

        <div className="flex justify-center mb-20 w-full">
          <Link href="/app">
            <Button
              size="lg"
              className="bg-blue-400 hover:bg-blue-500 text-white px-10 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Launch Platform
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Mailing List Join Box */}
        <div className="flex flex-col items-center justify-center mb-10">
          <JoinMailingList />
        </div>

        {/* Partner Ticker */}
        <div className="w-full max-w-4xl mx-auto mt-20">
          <PartnerTicker />
        </div>
      </div>
    </section>
  )
}
