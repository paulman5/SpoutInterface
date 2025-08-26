"use client";

// Mailing list functionality temporarily disabled
// TODO: Re-enable when email service is set up

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button as JoinButton } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export function JoinMailingList() {
  // Temporarily disabled - return empty component
  return null;

  /*
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
  */
}
