"use client"

import { useReadContract } from "wagmi"
import idFactoryABI from "@/abi/idfactory.json"
import onchainidABI from "@/abi/onchainid.json"
import { ethers } from "ethers"

export function useOnchainID({
  userAddress,
  idFactoryAddress,
  issuer,
  topic = 1,
}: {
  userAddress: string | undefined | null
  idFactoryAddress: string
  issuer: string
  topic?: number
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

  // Calculate claimId for KYC using ethers.js (v6)
  let claimId: `0x${string}` | undefined = undefined
  if (issuer && topic !== undefined) {
    const abiCoder = ethers.AbiCoder.defaultAbiCoder()
    claimId = ethers.keccak256(
      abiCoder.encode(["address", "uint256"], [issuer as `0x${string}`, topic])
    ) as `0x${string}`
  }

  // Fetch KYC claim from OnchainID contract
  const {
    data: kycClaim,
    isLoading: kycLoading,
    error: kycError,
  } = useReadContract({
    address: hasOnchainID ? (onchainID as `0x${string}`) : undefined,
    abi: onchainidABI,
    functionName: "getClaim",
    args: claimId ? [claimId] : undefined,
    query: { enabled: !!onchainID && !!claimId },
  })

  // Check if claim is valid (issuer should not be zero address and topic should match)
  const claimObj = kycClaim as any
  const hasKYCClaim =
    claimObj &&
    claimObj.issuer &&
    claimObj.issuer !== "0x0000000000000000000000000000000000000000" &&
    claimObj.topic !== undefined &&
    Number(claimObj.topic) === topic &&
    claimObj.issuer.toLowerCase() === issuer.toLowerCase()

  return {
    hasOnchainID,
    onchainIDAddress: onchainID,
    loading: isLoading,
    error,
    hasKYCClaim,
    kycClaim,
    kycLoading,
    kycError,
  }
}
