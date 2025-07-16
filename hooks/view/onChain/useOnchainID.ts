"use client"

import { useReadContract } from "wagmi"
import idFactoryABI from "@/abi/idfactory.json"

export function useOnchainID({
  userAddress,
  idFactoryAddress,
}: {
  userAddress: string | undefined | null
  idFactoryAddress: string
}) {
  const {
    data: onchainID,
    isLoading,
    error,
  } = useReadContract({
    address: idFactoryAddress as `0x${string}`,
    abi: idFactoryABI,
    functionName: "getIdentity",
    args: [userAddress as `0x${string}`],
    query: { enabled: !!userAddress },
  })

  const hasOnchainID =
    onchainID &&
    typeof onchainID === "string" &&
    onchainID !== "0x0000000000000000000000000000000000000000"

  return {
    hasOnchainID,
    onchainIDAddress: onchainID,
    loading: isLoading,
    error,
  }
}
