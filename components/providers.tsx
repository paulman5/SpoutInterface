"use client"

import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, http } from "wagmi"
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit"
import { baseSepolia } from "wagmi/chains"
import { AuthProvider } from "@/context/AuthContext"

const queryClient = new QueryClient()

// Custom config with more reliable RPC endpoints
const config = getDefaultConfig({
  appName: "Spout Finance",
  projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID ?? "",
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http("https://base-sepolia-rpc.publicnode.com"), // More reliable RPC
  },
  ssr: true,
})

const Providers = ({ children }: { children: ReactNode }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
)

export { Providers }
