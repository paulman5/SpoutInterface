import { useReadContract } from "wagmi"
import erc3643ABI from "@/abi/erc3643.json"

const TOKEN_ADDRESS = "0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB"

export function useTokenBalance(address: string | undefined) {
  // Get decimals
  const { data: decimals } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc3643ABI.abi,
    functionName: "decimals",
  })

  // Get balance
  const {
    data: balance,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc3643ABI.abi,
    functionName: "balanceOf",
    args: [address],
  })

  // Get token symbol
  const { data: symbol } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc3643ABI.abi,
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
