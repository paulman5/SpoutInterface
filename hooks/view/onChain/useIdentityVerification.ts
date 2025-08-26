import { useReadContract, useChainId } from "wagmi";
import { useContractAddress } from "@/lib/addresses";

// Basic Identity Registry ABI with isVerified function
const identityRegistryABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
    ],
    name: "isVerified",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useIdentityVerification(userAddress: string | undefined) {
  const chainId = useChainId();

  // Get the RWA token address to access its identity registry
  const rwaTokenAddress = useContractAddress("rwatoken");

  // First get the identity registry address from the RWA token
  const {
    data: identityRegistryAddress,
    isLoading: isLoadingRegistry,
    error: registryError,
  } = useReadContract({
    address: rwaTokenAddress as `0x${string}`,
    abi: [
      {
        inputs: [],
        name: "identityRegistry",
        outputs: [
          {
            internalType: "contract IIdentityRegistry",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "identityRegistry",
  });

  // Then check if the user is verified in the identity registry
  const {
    data: isVerified,
    isLoading: isLoadingVerification,
    error: verificationError,
    refetch: refetchVerification,
  } = useReadContract({
    address: identityRegistryAddress as `0x${string}`,
    abi: identityRegistryABI,
    functionName: "isVerified",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!identityRegistryAddress && !!userAddress,
    },
  });

  return {
    isVerified: isVerified || false,
    isLoading: isLoadingRegistry || isLoadingVerification,
    error: registryError || verificationError,
    refetch: refetchVerification,
    identityRegistryAddress,
  };
}
