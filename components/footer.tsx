"use client"
import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Heart, ArrowUp } from "lucide-react"
import Image from "next/image"
interface LinkItem {
  href: string
  label: string
}

interface FooterProps {
  leftLinks: LinkItem[]
  rightLinks: LinkItem[]
  copyrightText: string
  barCount?: number
}

export const Footer: React.FC<FooterProps> = ({
  leftLinks,
  rightLinks,
  copyrightText,
}) => {
  const waveRefs = useRef<(HTMLDivElement | null)[]>([])
  const footerRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.2 }
    )

    const currentFooterRef = footerRef.current
    if (currentFooterRef) {
      observer.observe(currentFooterRef)
    }

    return () => {
      if (currentFooterRef) {
        observer.unobserve(currentFooterRef)
      }
    }
  }, [])

  useEffect(() => {
    let t = 0

    const animateWave = () => {
      const waveElements = waveRefs.current
      let offset = 0

      waveElements.forEach((element, index) => {
        if (element) {
          offset += Math.max(0, 20 * Math.sin((t + index) * 0.3))
          element.style.transform = `translateY(${index + offset}px)`
        }
      })

      t += 0.1
      animationFrameRef.current = requestAnimationFrame(animateWave)
    }

    if (isVisible) {
      animateWave()
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isVisible])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer
      ref={footerRef}
      className="bg-slate-900 text-white relative flex flex-col w-full h-full justify-between select-none"
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between w-full gap-8 py-16 px-6 lg:px-12">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <Image
                src="/Whale.png"
                alt="spout finance logo"
                width={32}
                height={32}
              />
            </div>
            <span className="font-bold text-2xl text-white">Spout</span>
          </div>

          <p className="text-slate-300 text-lg max-w-md leading-relaxed">
            Professional trading platform with real-time market data, portfolio
            analytics, and seamless token swapping for serious investors.
          </p>

          <ul className="flex flex-wrap gap-6">
            {leftLinks.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.href}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-300 font-medium"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="pt-6">
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <svg className="size-4" viewBox="0 0 80 80">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill="currentColor"
                  d="M67.4307 11.5693C52.005 -3.85643 26.995 -3.85643 11.5693 11.5693C-3.85643 26.995 -3.85643 52.005 11.5693 67.4307C26.995 82.8564 52.005 82.8564 67.4307 67.4307C82.8564 52.005 82.8564 26.995 67.4307 11.5693ZM17.9332 17.9332C29.8442 6.02225 49.1558 6.02225 61.0668 17.9332C72.9777 29.8442 72.9777 49.1558 61.0668 61.0668C59.7316 62.4019 58.3035 63.5874 56.8032 64.6232L56.8241 64.6023C46.8657 54.6439 46.8657 38.4982 56.8241 28.5398L58.2383 27.1256L51.8744 20.7617L50.4602 22.1759C40.5018 32.1343 24.3561 32.1343 14.3977 22.1759L14.3768 22.1968C15.4126 20.6965 16.5981 19.2684 17.9332 17.9332ZM34.0282 38.6078C25.6372 38.9948 17.1318 36.3344 10.3131 30.6265C7.56889 39.6809 9.12599 49.76 14.9844 57.6517L34.0282 38.6078ZM21.3483 64.0156C29.24 69.874 39.3191 71.4311 48.3735 68.6869C42.6656 61.8682 40.0052 53.3628 40.3922 44.9718L21.3483 64.0156Z"
                />
              </svg>
              {copyrightText}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">
                Platform
              </h4>
              <ul className="space-y-3">
                {rightLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-slate-300 hover:text-emerald-400 transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700">
            <div className="flex items-center justify-end">
              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-emerald-400 transition-colors duration-300 group"
              >
                <span>Back to top</span>
                <ArrowUp className="h-4 w-4 group-hover:-translate-y-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Default footer component with Spout Finance links
const DefaultFooter = () => {
  const leftLinks = [
    { href: "/app/markets", label: "Markets" },
    { href: "/app/portfolio", label: "Portfolio" },
    { href: "/app/trade", label: "Trading" },
    // { href: "/app/earn", label: "Earn" },
  ]

  const rightLinks = [
    { href: "/contact", label: "Contact Us" },
    { href: "/company", label: "Company" },
    // { href: "/help", label: "Help Center" },
    // { href: "/privacy", label: "Privacy Policy" },
    // { href: "/terms", label: "Terms of Service" },
    // { href: "/careers", label: "Careers" },
    // { href: "/blog", label: "Blog" },
    // { href: "/security", label: "Security" },
  ]

  return (
    <Footer
      leftLinks={leftLinks}
      rightLinks={rightLinks}
      copyrightText={`© ${new Date().getFullYear()} Spout Finance. All rights reserved.`}
      barCount={25}
    />
  )
}

export default DefaultFooter
