import { useReadContract, useChainId } from "wagmi"
import erc20ABI from "@/abi/erc20.json"

const usdcAddresses: Record<number, string> = {
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
  688688: "0x72df0bcd7276f2dFbAc900D1CE63c272C4BCcCED", // Pharos
}

export function useUSDCTokenBalance(address: string | undefined) {
  const chainId = useChainId()
  const usdcAddress = usdcAddresses[chainId]

  // Get decimals
  const { data: decimals } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "decimals",
  })

  // Get balance
  const {
    data: balance,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address],
  })

  // Get token symbol
  const { data: symbol } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "symbol",
  })

  return {
    balance: balance && decimals ? Number(balance) / 10 ** Number(decimals) : 0,
    symbol: symbol as string | undefined,
    isError,
    isLoading,
    refetch,
  }
}
