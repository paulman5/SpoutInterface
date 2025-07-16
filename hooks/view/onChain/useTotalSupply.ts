import { useReadContract } from "wagmi"
import erc3643ABI from "@/abi/erc3643.json"

const TOKEN_ADDRESS = "0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB" // RWA token address

export function useTotalSupply() {
  const { data: totalSupply, isLoading } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc3643ABI.abi,
    functionName: "totalSupply",
  })

  return {
    totalSupply: totalSupply ? Number(totalSupply) / 1e6 : 0, // Convert from wei and assuming 6 decimals
    isLoading,
  }
}
