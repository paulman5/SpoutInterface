import "./globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import "react-toastify/dist/ReactToastify.css"
import type { Metadata } from "next"
import { Public_Sans, IBM_Plex_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"
import { ConditionalNavbar } from "@/components/conditionalNavbar"

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
})
export const metadata: Metadata = {
  title: "Spout Finance",
  description:
    "Spout Finance is a RWA platform tokenizing efficient collateral assets and building the next generation of collateral infrastructure",
  keywords: [
    "finance",
    "portfolio",
    "trading",
    "stocks",
    "investment",
    "RWA",
    "Corporate Bonds",
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen flex flex-col bg-gray-50 font-sans antialiased",
          publicSans.variable,
          ibmPlexMono.variable
        )}
      >
        <Providers>
          <ConditionalNavbar />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
