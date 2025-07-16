"use client"

import { ReactNode, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, http } from "wagmi"
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit"
import { baseSepolia } from "wagmi/chains"
import { AuthProvider } from "@/context/AuthContext"
import { pharos } from "@/lib/chainconfigs/pharos"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"

const queryClient = new QueryClient()

// Custom config with more reliable RPC endpoints
const config = getDefaultConfig({
  appName: "Spout Finance",
  projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID ?? "",
  chains: [baseSepolia, pharos],
  transports: {
    [baseSepolia.id]: http("https://base-sepolia-rpc.publicnode.com"), // More reliable RPC
    [pharos.id]: http("https://testnet.dplabs-internal.com"),
  },
  ssr: true,
})

function WalletConnectionPrompt() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  useEffect(() => {
    if (!isConnected) {
      toast("Wallet not connected", {
        description: "Please connect your wallet to continue.",
        action: {
          label: "Connect Wallet",
          onClick: openConnectModal ?? (() => {}),
        },
        duration: Infinity,
      })
    }
  }, [isConnected, openConnectModal])

  return null
}

const Providers = ({ children }: { children: ReactNode }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <AuthProvider>
          <WalletConnectionPrompt />
          {children}
        </AuthProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
)

export { Providers }
