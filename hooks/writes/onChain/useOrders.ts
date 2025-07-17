import { useWriteContract } from "wagmi"
import ordersABIFile from "@/abi/ordersBlocksense.json"
import { useContractAddress } from "@/lib/addresses"

const ordersABI = Array.isArray(ordersABIFile)
  ? ordersABIFile
  : ordersABIFile.abi

export function useOrdersContract() {
  const ordersAddress = useContractAddress("orders")
  const { writeContract, data, isPending, isSuccess, error } =
    useWriteContract()

  // Buy asset interaction (adfsFeedId, ticker, token, usdcAmount)
  function buyAsset(
    adfsFeedId: bigint,
    ticker: string,
    token: `0x${string}`,
    usdcAmount: bigint
  ) {
    return writeContract({
      address: ordersAddress as `0x${string}`,
      abi: ordersABI,
      functionName: "buyAsset",
      args: [adfsFeedId, ticker, token, usdcAmount],
    })
  }

  // Sell asset interaction (adfsFeedId, ticker, token, tokenAmount)
  function sellAsset(
    adfsFeedId: bigint,
    ticker: string,
    token: `0x${string}`,
    tokenAmount: bigint
  ) {
    return writeContract({
      address: ordersAddress as `0x${string}`,
      abi: ordersABI,
      functionName: "sellAsset",
      args: [adfsFeedId, ticker, token, tokenAmount],
    })
  }

  return {
    buyAsset,
    sellAsset,
    data,
    isPending,
    isSuccess,
    error,
  }
}
