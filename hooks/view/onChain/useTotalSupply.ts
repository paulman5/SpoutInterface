import { useReadContract, useChainId } from "wagmi"
import erc3643ABI from "@/abi/erc3643.json"

const tokenAddresses: Record<number, string> = {
  84532: "0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB", // Base Sepolia
  688688: "0x54b753555853ce22f66Ac8CB8e324EB607C4e4eE", // Pharos
}

export function useTotalSupply() {
  const chainId = useChainId()
  const tokenAddress = tokenAddresses[chainId]

  const { data: totalSupply, isLoading } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc3643ABI.abi,
    functionName: "totalSupply",
  })

  return {
    totalSupply: totalSupply ? Number(totalSupply) / 1e6 : 0, // Convert from wei and assuming 6 decimals
    isLoading,
  }
}
