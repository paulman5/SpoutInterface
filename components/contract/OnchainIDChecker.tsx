"use client"

import { useAccount } from "wagmi"
import { toast } from "sonner"
import { useOnchainID } from "@/hooks/view/onChain/useOnchainID"
import React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export default function OnchainIDChecker() {
  const { address: userAddress } = useAccount()
  const idFactoryAddress = "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536"
  const { hasOnchainID, loading: onchainIDLoading } = useOnchainID({
    userAddress,
    idFactoryAddress,
  })
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    // Dismiss toast if already on the KYC tab
    if (pathname === "/app/profile" && searchParams?.get("tab") === "kyc") {
      toast.dismiss()
    }
  }, [pathname, searchParams])

  React.useEffect(() => {
    // Only show the toast if NOT already on the KYC tab
    if (
      hasOnchainID === false &&
      !onchainIDLoading &&
      !(pathname === "/app/profile" && searchParams?.get("tab") === "kyc")
    ) {
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
    }
  }, [hasOnchainID, onchainIDLoading, router, pathname, searchParams])

  return null
}
