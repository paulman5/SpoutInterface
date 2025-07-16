import { useReadContract } from "wagmi"
import erc20ABI from "@/abi/erc20.json"

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

export function useUSDCTokenBalance(address: string | undefined) {
  // Get decimals
  const { data: decimals } = useReadContract({
    address: USDC_ADDRESS,
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
    address: USDC_ADDRESS,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address],
  })

  // Get token symbol
  const { data: symbol } = useReadContract({
    address: USDC_ADDRESS,
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
