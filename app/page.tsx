"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Zap } from "lucide-react"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { useScreenSize } from "@/hooks/use-screen-size"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Features } from "@/components/features"
import DefaultFooter from "@/components/footer"
import { Waves } from "@/components/wave-background"
import { Input } from "@/components/ui/input"
import { Button as JoinButton } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { LoadingSpinner } from "@/components/loadingSpinner"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle } from "lucide-react"
import PartnerTicker from "@/components/partner-ticker"

const mailingListSchema = z.object({
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
})

type MailingListFormData = z.infer<typeof mailingListSchema>

function JoinMailingList() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [joined, setJoined] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    if (!email) {
      setError("Please enter your email.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(data.message || "Thank you for joining!")
        setEmail("")
        setJoined(true)
      } else {
        setError(data.error || data.message || "Something went wrong.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 w-full max-w-xs mx-auto items-center"
    >
      {!joined && (
        <Input
          type="email"
          placeholder="Join our mailing list"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white/80 border-slate-200 focus-visible:ring-emerald-600"
          disabled={loading}
          required
        />
      )}
      <AnimatePresence initial={false} mode="wait">
        {!joined ? (
          <motion.div
            key="join"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            <JoinButton
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-semibold"
              isDisabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : "Join"}
            </JoinButton>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {joined && (
        <div className="flex items-center justify-center w-full mt-2 flex-nowrap whitespace-nowrap">
          <CheckCircle className="h-8 w-8 text-emerald-600 mr-2" />
          <span className="text-emerald-700 font-semibold text-lg align-middle">
            {message || "Already joined!"}
          </span>
        </div>
      )}
      {error && !joined && (
        <div className="w-full text-center text-red-500 text-xs mt-2">
          {error}
        </div>
      )}
    </form>
  )
}

export default function HomePage() {
  const screenSize = useScreenSize()

  const {
    formState: { errors },
    reset,
  } = useForm<MailingListFormData>({
    resolver: zodResolver(mailingListSchema),
  })

  const onSubmit = async (data: MailingListFormData) => {
    if (!data.email) {
      alert("Email is required to join the mailing list.")
      return
    }

    try {
      const response = await fetch("/api/mailing-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        alert("You have successfully joined the mailing list!")
        reset()
      } else {
        const errorData = await response.json()
        alert(`Failed to join mailing list: ${errorData.message}`)
      }
    } catch (error) {
      alert("An error occurred while joining the mailing list.")
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden flex flex-col items-center justify-center">
      {/* Hero Section */}
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
              className="mb-6 px-4 py-2 text-sm font-medium bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 hover:border-emerald-200"
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
          {/* Partner Ticker Section */}
          <section className="w-full max-w-4xl mx-auto mt-20">
            <PartnerTicker />
          </section>

          {/* Live Stats */}
          {/*
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platformStats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 mb-1">{stat.label}</div>
                  <div
                    className={`text-xs font-medium ${stat.change.includes("+") ? "text-emerald-600" : stat.change.includes("-") ? "text-red-500" : "text-slate-500"}`}
                  >
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
          */}
        </div>
      </section>

      {/* Proof of Reserve Section */}
      <section className="relative py-24 bg-gradient-to-b from-neutral-800 to-emerald-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Waves />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-6">
              Proof of Reserve
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Every token is fully backed 1:1 by investment-grade bond ETFs,
              held by qualified U.S. custodians for maximum security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white/90 backdrop-blur-md border-emerald-200/30 hover:bg-white/95 transition-all duration-300 rounded-2xl shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      $2.4B
                    </div>
                    <div className="text-slate-600 text-sm">
                      Total Reserve Value
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
                    Verified
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Backing Ratio</span>
                    <span className="font-bold text-slate-900 text-xl">
                      1:1
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Last Audit</span>
                    <span className="font-semibold text-slate-900">Today</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-md border-emerald-200/30 hover:bg-white/95 transition-all duration-300 rounded-2xl shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      AAA-Rated
                    </div>
                    <div className="text-slate-600 text-sm">ETF Backing</div>
                  </div>
                  <div className="px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                    LQD
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Primary ETF</span>
                    <span className="font-bold text-slate-900 text-xl">
                      LQD
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Custodian</span>
                    <span className="font-semibold text-slate-900">
                      U.S. Qualified
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-md border-emerald-200/30 hover:bg-white/95 transition-all duration-300 rounded-2xl shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      100%
                    </div>
                    <div className="text-slate-600 text-sm">Collateralized</div>
                  </div>
                  <div className="px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800">
                    Secure
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Reserve Type</span>
                    <span className="font-bold text-slate-900 text-xl">
                      Bonds
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Insurance</span>
                    <span className="font-semibold text-slate-900">FDIC</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-emerald-200/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Investment-Grade Security
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Each token is backed 1:1 by investment-grade bond ETFs like
                  LQD, held by a qualified U.S. custodian. This ensures maximum
                  security and stability for your investments.
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    AAA-rated corporate bond ETFs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Qualified U.S. custodian oversight
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Real-time reserve verification
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Transparent Reserves
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Our proof of reserve system provides complete transparency.
                  View real-time data showing exactly how your tokens are backed
                  by high-quality, liquid assets.
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Daily reserve audits
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Public blockchain verification
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Independent third-party validation
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/app">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-600 px-8 py-3 rounded-xl"
              >
                View Reserve Details
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-white overflow-hidden">
        <PixelTrail
          fadeDuration={1200}
          delay={300}
          pixelClassName="rounded-2xl bg-emerald-600/15"
          pixelSize={screenSize.lessThan("md") ? 40 : 60}
        />
        <Features />
      </section>

      {/* Animated Footer */}
      <DefaultFooter />
    </div>
  )
}
