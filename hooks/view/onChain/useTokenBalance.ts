import { useReadContract, useChainId } from "wagmi"
import erc3643ABI from "@/abi/erc3643.json"

const tokenAddresses: Record<number, string> = {
  84532: "0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB", // Base Sepolia
  688688: "0x54b753555853ce22f66Ac8CB8e324EB607C4e4eE", // Pharos Testnet
}

export function useTokenBalance(address: string | undefined) {
  const chainId = useChainId()
  const tokenAddress = tokenAddresses[chainId]

  // Get decimals
  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
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
    address: tokenAddress as `0x${string}`,
    abi: erc3643ABI.abi,
    functionName: "balanceOf",
    args: [address],
  })

  // Get token symbol
  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
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
