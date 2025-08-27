import { useAccount, useReadContract, useWriteContract } from "wagmi";
import ordersABI from "@/abi/ordersBlocksense.json";

export function useOrdersContract(ordersAddress: `0x${string}`) {
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
  const {
    writeContract: withdrawUSDC,
    isPending: isWithdrawUSDCPending,
    error: withdrawUSDCError,
  } = useWriteContract();

  // Read functions (example: pendingBuyOrders, pendingSellOrders)
  const readPendingBuyOrder = (requestId: string) =>
    useReadContract({
      address: ordersAddress,
      abi: ordersABI as any,
      functionName: "pendingBuyOrders",
      args: [requestId],
    });

  const readPendingSellOrder = (requestId: string) =>
    useReadContract({
      address: ordersAddress,
      abi: ordersABI as any,
      functionName: "pendingSellOrders",
      args: [requestId],
    });

  // Function calls
  const executeBuyAsset = (
    asset: string,
    ticker: string,
    token: `0x${string}`,
    usdcAmount: bigint,
    subscriptionId: bigint,
    orderAddr: `0x${string}`,
  ) => {
    buyAsset({
      address: ordersAddress,
      abi: ordersABI as any,
      functionName: "buyAsset",
      args: [asset, ticker, token, usdcAmount, subscriptionId, orderAddr],
    });
  };

  const executeSellAsset = (
    asset: string,
    ticker: string,
    token: `0x${string}`,
    tokenAmount: bigint,
    subscriptionId: bigint,
    orderAddr: `0x${string}`,
  ) => {
    sellAsset({
      address: ordersAddress,
      abi: ordersABI as any,
      functionName: "sellAsset",
      args: [asset, ticker, token, tokenAmount, subscriptionId, orderAddr],
    });
  };

  const executeWithdrawUSDC = (amount: bigint) => {
    withdrawUSDC({
      address: ordersAddress,
      abi: ordersABI as any,
      functionName: "withdrawUSDC",
      args: [amount],
    });
  };

  return {
    address,
    // Write functions with their states
    buyAsset: executeBuyAsset,
    sellAsset: executeSellAsset,
    withdrawUSDC: executeWithdrawUSDC,
    // Loading states
    isBuyAssetPending,
    isSellAssetPending,
    isWithdrawUSDCPending,
    // Error states
    buyAssetError,
    sellAssetError,
    withdrawUSDCError,
    // Read functions
    readPendingBuyOrder,
    readPendingSellOrder,
  };
}
