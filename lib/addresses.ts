export const contractaddresses = {
  gateway: {
    84532: "0xf04430Ffe6da40FE233c50909A9ebEA43dc8FDaB", // Base Sepolia
    688688: "0x126F0c11F3e5EafE37AB143D4AA688429ef7DCB3", // Pharos Testnet
  },
  idfactory: {
    84532: "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536", // Base Sepolia
    688688: "0x18cB5F2774a80121d1067007933285B32516226a", // Pharos Testnet
  },
  issuer: {
    84532: "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F", // Base Sepolia
    688688: "0xA5C77b623BEB3bC0071fA568de99e15Ccc06C7cb", // Pharos Testnet
  },
  orders: {
    84532: "0xBa20ef0d4A8015f92E70dfdf73964EbD5f67bAd1", // Base Sepolia
    688688: "0x9538f2F5a1a9528696665275D2bC12291266a557", // Pharos Testnet
  },
  usdc: {
    84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
    688688: "0x72df0bcd7276f2dFbAc900D1CE63c272C4BCcCED", // Pharos Testnet
  },
  rwatoken: {
    84532: "0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB", // Base Sepolia
    688688: "0x54b753555853ce22f66Ac8CB8e324EB607C4e4eE", // Pharos Testnet
  },
  // Add more contracts as needed
}

import { useChainId } from "wagmi"

export function useContractAddress(contract: keyof typeof contractaddresses) {
  const chainId = useChainId()
  console.log("current chainID:", chainId)
  const mapping = contractaddresses[contract] as Record<number, string>
  return mapping[chainId]
}
