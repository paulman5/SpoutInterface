import { useAccount, useReadContract, useWriteContract } from "wagmi";
import confidentialOrdersABI from "@/abi/confidentailorders.json";

export function useConfidentialOrdersContract(ordersAddress: `0x${string}`) {
  const { address } = useAccount();

  // Write functions
  const {
    writeContract: buyAsset,
    isPending: isBuyAssetPending,
    error: buyAssetError,
  } = useWriteContract();
  const {
    writeContract: sellAsset,
    isPending: isSellAssetPending,
    error: sellAssetError,
  } = useWriteContract();

  // Read functions
  const readPendingBuyOrder = (requestId: string) =>
    useReadContract({
      address: ordersAddress,
      abi: confidentialOrdersABI as any,
      functionName: "pendingBuyOrders",
      args: [requestId],
    });

  const readPendingSellOrder = (requestId: string) =>
    useReadContract({
      address: ordersAddress,
      abi: confidentialOrdersABI as any,
      functionName: "pendingSellOrders",
      args: [requestId],
    });

  // Function calls
  /**
   * buyAsset - encrypted USDC amount must be a bytes value (see Inco SDK)
   */
  const executeBuyAsset = (
    asset: string,
    ticker: string,
    token: `0x${string}`,
    usdcAmountBytes: `0x${string}`,
    subscriptionId: bigint,
    orderAddr: `0x${string}`,
  ) => {
    buyAsset({
      address: ordersAddress,
      abi: confidentialOrdersABI as any,
      functionName: "buyAsset",
      args: [asset, ticker, token, usdcAmountBytes, subscriptionId, orderAddr],
    });
  };

  /**
   * sellAsset - encrypted token amount must be a bytes value (see Inco SDK)
   */
  const executeSellAsset = (
    asset: string,
    ticker: string,
    token: `0x${string}`,
    tokenAmountBytes: `0x${string}`,
    subscriptionId: bigint,
    orderAddr: `0x${string}`,
  ) => {
    sellAsset({
      address: ordersAddress,
      abi: confidentialOrdersABI as any,
      functionName: "sellAsset",
      args: [asset, ticker, token, tokenAmountBytes, subscriptionId, orderAddr],
    });
  };

  return {
    address,
    // Write functions with their states
    buyAsset: executeBuyAsset,
    sellAsset: executeSellAsset,
    isBuyAssetPending,
    isSellAssetPending,
    buyAssetError,
    sellAssetError,
    // Read functions
    readPendingBuyOrder,
    readPendingSellOrder,
  };
}
