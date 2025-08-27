import { useWriteContract } from "wagmi";
import erc3643ABI from "@/abi/erc3643.json";

export function useERC20Approve(tokenAddress: `0x${string}`) {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const approve = (spender: `0x${string}`, amount: bigint) => {
    return writeContractAsync({
      address: tokenAddress,
      abi: erc3643ABI.abi as any,
      functionName: "approve",
      args: [spender, amount],
    });
  };

  return { approve, isPending, error };
}
