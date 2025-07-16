// # Feature implementation hash addresses and match them against the stored keyhashes and if they match save in backend
// # and display them to the user in the identity tab

// import { useReadContract } from "wagmi"
// import identityAbi from "@/abi/identity.json"

// export function useIdentityContract(address?: string) {
//   // Get contract version
//   const version = useReadContract({
//     address: address as `0x${string}`,
//     abi: identityAbi.abi,
//     functionName: "version",
//   })

//   // Get management keys (purpose = 1)
//   const managementKeys = useReadContract({
//     address: address as `0x${string}`,
//     abi: identityAbi.abi,
//     functionName: "getKeysByPurpose",
//     args: [1],
//   })

//   // Get action keys (purpose = 2)
//   const actionKeys = useReadContract({
//     address: address as `0x${string}`,
//     abi: identityAbi.abi,
//     functionName: "getKeysByPurpose",
//     args: [2],
//   })
//   // Get action keys (purpose = 2)
//   const claimKeys = useReadContract({
//     address: address as `0x${string}`,
//     abi: identityAbi.abi,
//     functionName: "getKeysByPurpose",
//     args: [3],
//   })

//   // Helper: Get claim IDs by topic
//   function useClaimIdsByTopic(topic: number) {
//     return useReadContract({
//       address: address as `0x${string}`,
//       abi: identityAbi.abi,
//       functionName: "getClaimIdsByTopic",
//       args: [topic],
//     })
//   }

//   // Helper: Get a specific claim by claimId
//   function useClaim(claimId: string) {
//     return useReadContract({
//       address: address as `0x${string}`,
//       abi: identityAbi.abi,
//       functionName: "getClaim",
//       args: [claimId],
//     })
//   }

//   return {
//     version,
//     managementKeys,
//     actionKeys,
//     claimKeys,
//     useClaimIdsByTopic,
//     useClaim,
//   }
// }
