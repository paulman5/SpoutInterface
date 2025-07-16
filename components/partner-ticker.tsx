"use client"

import React, { useRef, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

const initialPartners = [
  {
    src: "/partners/Alpaca.svg",
    alt: "Alpaca",
    link: "https://alpaca.markets/",
  },
  {
    src: "/partners/Blocksense.png",
    alt: "Blocksense",
    link: "https://blocksense.network/",
  },
  {
    src: "/partners/Chainlink.svg",
    alt: "Chainlink",
    link: "https://chain.link/",
  },
  {
    src: "/partners/ERC3643Full.png",
    alt: "ERC3643",
    link: "https://www.erc3643.org/",
  },
  {
    src: "/partners/Faroswap.svg",
    alt: "Faroswap",
    link: "https://faroswap.xyz/",
  },
  {
    src: "/partners/Inco.png",
    alt: "Inco",
    link: "https://www.inco.org/",
  },
  {
    src: "/partners/Pharos.svg",
    alt: "Pharos",
    link: "https://pharosnetwork.xyz/",
  },
]

export default function PartnerTicker() {
  const [offset, setOffset] = useState(0)
  const tickerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const speed = 0.6

  useEffect(() => {
    let frame: number
    const animate = () => {
      if (contentRef.current) {
        const scrollWidth = contentRef.current.scrollWidth / 3
        setOffset((prev) => {
          const next = prev - speed
          return Math.abs(next) >= scrollWidth ? 0 : next
        })
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className="w-full overflow-x-hidden h-16 relative"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
    >
      <div
        ref={tickerRef}
        className="flex h-16 will-change-transform"
        style={{ transform: `translateX(${offset}px)` }}
      >
        <div
          ref={contentRef}
          className="flex items-center gap-12 h-16 shrink-0"
        >
          {[...initialPartners, ...initialPartners, ...initialPartners].map(
            (partner, idx) => (
              <Link
                key={idx}
                href={partner.link}
                passHref
                target="_blank"
                rel="noopener noreferrer"
                className="focus:outline-none"
                tabIndex={0}
                aria-label={partner.alt}
                style={{
                  display: "inline-block",
                  transition: "opacity 0.3s linear",
                }}
              >
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={80}
                  height={48}
                  className="h-12 w-auto object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                  draggable={false}
                  style={{ userSelect: "none" }}
                />
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  )
}
