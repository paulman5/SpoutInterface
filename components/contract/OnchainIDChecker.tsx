"use client"

import { useAccount } from "wagmi"
import { toast } from "sonner"
import { useOnchainID } from "@/hooks/view/onChain/useOnchainID"
import React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useContractAddress } from "@/lib/addresses"
import { useUSDCTokenBalance } from "@/hooks/view/onChain/useUSDCTokenBalance"

export default function OnchainIDChecker() {
  const { address: userAddress } = useAccount()
  const idFactoryAddress = "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536"
  const issuerAddress = useContractAddress("issuer")
  const { hasOnchainID, loading: onchainIDLoading } = useOnchainID({
    userAddress,
    idFactoryAddress,
    issuer: issuerAddress,
    topic: 1,
  })
  const { balance: usdcBalance, isLoading: usdcLoading } =
    useUSDCTokenBalance(userAddress)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    // Dismiss toast if already on the KYC tab
    if (pathname === "/app/profile" && searchParams?.get("tab") === "kyc") {
      toast.dismiss()
    }
  }, [pathname, searchParams])

  // Show 'Claim USDC' Sonner if user has no USDC, but only on the trade page
  React.useEffect(() => {
    console.log('[USDC Sonner Debug] usdcBalance:', usdcBalance, 'usdcLoading:', usdcLoading, 'pathname:', pathname)
    if (
      !usdcLoading &&
      Number(usdcBalance) <= 0 &&
      String(pathname) === "/app/trade"
    ) {
      console.log('[USDC Sonner Debug] ✅ Conditions met, showing USDC Sonner')
      toast.warning(
        "You need USDC to start trading. Claim your testnet USDC to begin.",
        {
          action: {
            label: "Claim USDC",
            onClick: () => {
              window.open("https://testnet.zenithswap.xyz/swap", "_blank")
              toast.dismiss()
            },
          },
          duration: Infinity,
        }
      )
    } else {
      console.log('[USDC Sonner Debug] ❌ Conditions not met:')
      console.log('  - !usdcLoading:', !usdcLoading)
      console.log('  - Number(usdcBalance) <= 0:', Number(usdcBalance) <= 0)
      console.log('  - pathname === "/app/trade":', String(pathname) === "/app/trade")
    }
  }, [usdcBalance, usdcLoading, pathname, searchParams])

  // Show 'Complete Profile' Sonner if user has not completed KYC
  React.useEffect(() => {
    console.log('[KYC Sonner Debug] hasOnchainID:', hasOnchainID, 'onchainIDLoading:', onchainIDLoading, 'pathname:', pathname, 'searchParams:', searchParams?.get("tab"))
    
    if (
      hasOnchainID === false &&
      !onchainIDLoading &&
      !(pathname === "/app/profile" && searchParams?.get("tab") === "kyc")
    ) {
      console.log('[KYC Sonner Debug] ✅ Conditions met, showing KYC Sonner')
      toast.warning(
        "Complete KYC and create your onchainIdentity to buy Spout tokens",
        {
          action: {
            label: "Complete Profile",
            onClick: () => {
              router.push("/app/profile?tab=kyc")
              toast.dismiss()
            },
          },
          duration: Infinity,
        }
      )
    } else {
      console.log('[KYC Sonner Debug] ❌ Conditions not met:')
      console.log('  - hasOnchainID === false:', hasOnchainID === false)
      console.log('  - !onchainIDLoading:', !onchainIDLoading)
      console.log('  - Not on KYC page:', !(pathname === "/app/profile" && searchParams?.get("tab") === "kyc"))
    }
  }, [hasOnchainID, onchainIDLoading, router, pathname, searchParams])

  return null
}
