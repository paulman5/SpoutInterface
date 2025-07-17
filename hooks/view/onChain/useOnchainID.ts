"use client"

import { useReadContract } from "wagmi"
import idFactoryABI from "@/abi/idfactory.json"
import onchainidABI from "@/abi/onchainid.json"
import { ethers } from "ethers"
import { AbiCoder, keccak256 } from "ethers"

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
  // Defensive: Only run contract read if all required values are present
  const canReadIdentity = !!userAddress && !!idFactoryAddress
  const {
    data: onchainID,
    isLoading,
    error,
  } = useReadContract({
    address: canReadIdentity ? (idFactoryAddress as `0x${string}`) : undefined,
    abi: idFactoryABI,
    functionName: "getIdentity",
    args: canReadIdentity ? [userAddress as `0x${string}`] : [],
    query: { enabled: canReadIdentity },
  })

  const hasOnchainID =
    onchainID &&
    typeof onchainID === "string" &&
    onchainID !== "0x0000000000000000000000000000000000000000"

  // Calculate claimId for KYC using ethers.js (v6) only if issuer and topic are defined
  let claimId: `0x${string}` | undefined = undefined
  if (issuer && topic !== undefined) {
    const abiCoder = AbiCoder.defaultAbiCoder()
    claimId = keccak256(
      abiCoder.encode(["address", "uint256"], [issuer as `0x${string}`, topic])
    ) as `0x${string}`
    // Log only when all values are present
    console.log("issuer address", issuer)
    console.log("topic", topic)
    console.log("claimId", claimId)
  }

  // Only read claim if onchainID and claimId are present
  const canReadClaim = !!onchainID && !!claimId
  const {
    data: kycClaim,
    isLoading: kycLoading,
    error: kycError,
  } = useReadContract({
    address: canReadClaim ? (onchainID as `0x${string}`) : undefined,
    abi: onchainidABI,
    functionName: "getClaim",
    args: canReadClaim ? [claimId] : [],
    query: { enabled: canReadClaim },
  })

  // Check if claim is valid (issuer should not be zero address and topic should match)
  let hasKYCClaim = false
  console.log("kycClaim data:", kycClaim)
  if (kycClaim && issuer && topic !== undefined && Array.isArray(kycClaim)) {
    hasKYCClaim =
      kycClaim[2] && // issuer
      kycClaim[2].toLowerCase() === issuer.toLowerCase() &&
      kycClaim[0] !== undefined &&
      Number(kycClaim[0]) === topic &&
      kycClaim[2] !== "0x0000000000000000000000000000000000000000"
    console.log("hasKYCClaim", hasKYCClaim)
  }

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
