"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import reserveABI from "@/abi/proof-of-reserve.json";

export function useReserveContract(reserveAddress: `0x${string}`) {
  const { address } = useAccount();

  // Write functions
  const {
    writeContract: requestReserves,
    isPending: isRequestPending,
    error: requestError,
  } = useWriteContract();

  // Read functions
  const { data: totalReserves, refetch: refetchReserves } = useReadContract({
    address: reserveAddress,
    abi: reserveABI as any,
    functionName: "getReserves",
  });

  const { data: totalReservesFromContract } = useReadContract({
    address: reserveAddress,
    abi: reserveABI as any,
    functionName: "totalReserves",
  });

  // Function calls
  const executeRequestReserves = (subscriptionId: number) => {
    requestReserves({
      address: reserveAddress,
      abi: reserveABI as any,
      functionName: "requestReserves",
      args: [subscriptionId],
    });
  };

  return {
    address,
    // Write functions
    requestReserves: executeRequestReserves,
    isRequestPending,
    requestError,
    // Read functions
    totalReserves,
    totalReservesFromContract,
    refetchReserves,
  };
}
