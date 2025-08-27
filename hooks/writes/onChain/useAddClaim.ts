import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import onchainidABI from "@/abi/onchainid.json";
import { concatHex } from "viem";
import { ethers } from "ethers";
import { useState } from "react";

export function useAddClaim() {
  const [error, setError] = useState<string>("");
  const {
    writeContract,
    data: addClaimHash,
    isPending: isAddingClaim,
  } = useWriteContract();
  const { isLoading: isConfirmingClaim, isSuccess: isClaimAdded } =
    useWaitForTransactionReceipt({
      hash: addClaimHash,
    });

  // args: { onchainIDAddress, issuerAddress, signature, topic, claimData, account }
  const addClaim = async ({
    onchainIDAddress,
    issuerAddress,
    signature,
    topic = 1,
    claimData = "KYC passed",
    account,
  }: {
    onchainIDAddress: string;
    issuerAddress: string;
    signature: { r: string; s: string; v: number };
    topic?: number;
    claimData?: string;
    account: string;
  }) => {
    setError("");
    try {
      // Prepare claim data
      const claimDataBytes = ethers.toUtf8Bytes(claimData);
      const claimDataHash = ethers.keccak256(claimDataBytes);
      // Prepare signature
      const r = (
        signature.r.startsWith("0x") ? signature.r : `0x${signature.r}`
      ) as `0x${string}`;
      const s = (
        signature.s.startsWith("0x") ? signature.s : `0x${signature.s}`
      ) as `0x${string}`;
      const v =
        `0x${signature.v.toString(16).padStart(2, "0")}` as `0x${string}`;
      const sig = concatHex([r, s, v]) as `0x${string}`;
      // Contract args
      const contractArgs = [
        topic,
        1, // scheme
        issuerAddress as `0x${string}`,
        sig,
        claimDataHash,
        "",
      ];
      writeContract({
        address: onchainIDAddress as `0x${string}`,
        abi: onchainidABI as any,
        functionName: "addClaim",
        args: contractArgs,
        account: account as `0x${string}`,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to add claim");
    }
  };

  return {
    addClaim,
    isAddingClaim,
    isConfirmingClaim,
    isClaimAdded,
    error,
  };
}
