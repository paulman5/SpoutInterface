"use client"

import { useState, useEffect } from "react"
import { useWatchContractEvent, usePublicClient, useReadContract, useChainId } from "wagmi"
import { useMarketData } from "@/hooks/api/useMarketData"
import erc3643ABI from "@/abi/erc3643.json"
import { useContractAddress } from "@/lib/addresses"

export interface ActivityEvent {
  id: string
  action: string
  symbol: string
  amount: string
  time: string
  value: string
  blockNumber?: number
  transactionType: string
}

export function useRecentActivity(userAddress?: string) {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [allTransactions, setAllTransactions] = useState<any[]>([])
  const [showCount, setShowCount] = useState(5)
  const publicClient = usePublicClient()
  const chainId = useChainId()
  const { price: currentPrice } = useMarketData("LQD")

  // Get the correct contract address for the current network
  const rwaTokenAddress = useContractAddress("rwatoken") as `0x${string}`

  // Add a constant for fallback price
  const FALLBACK_PRICE = 108.725

  // Helper functions - we'll get decimals dynamically
  const formatAmount = (amount: bigint, decimals: number = 6) => {
    try {
      // Convert to string and handle decimals
      const value = Number(amount) / Math.pow(10, decimals)
      if (isNaN(value)) {
        console.error("Invalid amount value:", amount.toString())
        return "0"
      }
      return value.toLocaleString()
    } catch (error) {
      console.error("Error formatting amount:", error)
      return "0"
    }
  }

  // Add a function to calculate value for large numbers
  const calculateValue = (amount: bigint, price: number, decimals: number) => {
    try {
      // Convert to number with decimals
      const valueStr = amount.toString()
      const decimalPoint = valueStr.length - decimals
      const wholePartStr = valueStr.slice(0, decimalPoint) || "0"
      const fractionalPartStr = valueStr.slice(decimalPoint)

      // Calculate the whole number part
      const wholePart = BigInt(wholePartStr)
      // Calculate the fractional part if it exists
      const fractionalPart = fractionalPartStr
        ? Number(`0.${fractionalPartStr}`)
        : 0

      // Convert whole part to number safely
      const wholeValue = Number(wholePart)

      // Calculate final value
      return (wholeValue + fractionalPart) * price
    } catch (error) {
      console.error("Error calculating value:", error)
      return 0
    }
  }

  // Add a function to get a valid price
  const getValidPrice = (price: number | null) => {
    if (typeof price === "number" && !isNaN(price) && price > 0) {
      return price
    }
    return FALLBACK_PRICE
  }

  // Add a function to format currency values
  const formatCurrencyValue = (value: number) => {
    try {
      if (isNaN(value) || !isFinite(value)) {
        console.error("Invalid currency value:", value)
        return "$0"
      }
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    } catch (error) {
      console.error("Error formatting currency:", error)
      return "$0"
    }
  }

  // Get the actual decimals from the contract
  const { data: contractDecimals } = useReadContract({
    address: rwaTokenAddress,
    abi: erc3643ABI.abi,
    functionName: "decimals",
  })

  console.log("Contract decimals:", contractDecimals)
  const decimals = contractDecimals ? Number(contractDecimals) : 18 // Change default to 18 which is more common

  // Helper functions - we'll get decimals dynamically
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  // Watch for new mint/burn events (Transfer from/to zero address involving user's address)
  useWatchContractEvent({
    address: rwaTokenAddress,
    abi: erc3643ABI.abi as any,
    eventName: "Transfer",
    onLogs(logs) {
      if (!userAddress) return // Skip if no user address provided

      const newTransactions = logs
        .filter((log: any) => {
          const isMint =
            log.args.from === "0x0000000000000000000000000000000000000000" &&
            log.args.to?.toLowerCase() === userAddress.toLowerCase()
          const isBurn =
            log.args.to === "0x0000000000000000000000000000000000000000" &&
            log.args.from?.toLowerCase() === userAddress.toLowerCase()
          return isMint || isBurn
        })
        .map((log: any) => {
          const amount = Number(formatAmount(log.args.value, decimals))
          const value = currentPrice ? amount * currentPrice : 0
          const isMint =
            log.args.from === "0x0000000000000000000000000000000000000000"
          const action = isMint ? "Purchased" : "Burned"
          return {
            id: `${log.transactionHash}-${log.logIndex}`,
            action,
            symbol: "RWA",
            amount: `${amount} tokens`,
            time: getTimeAgo(Date.now()),
            value: `$${value.toFixed(0)}`,
            blockNumber: Number(log.blockNumber),
            transactionType: action === "Burned" ? "SLQD Sold" : "SLQD Bought",
          }
        })

      if (newTransactions.length > 0) {
        setActivities((prev) => {
          const updatedTransactions = newTransactions.map((tx) => ({
            ...tx,
            transactionType:
              tx.action === "Burned" ? "SLQD Sold" : "SLQD Bought",
          }))
          return [...updatedTransactions, ...prev].slice(0, 10)
        })
      }
    },
  })

  // Fetch recent mint events on mount
  useEffect(() => {
    console.log("🔄 Starting transaction fetch...")
    console.log("Current state:", {
      decimals,
      currentPrice,
      hasUserAddress: !!userAddress,
      userAddress,
      chainId,
      rwaTokenAddress,
      hasPublicClient: !!publicClient,
    })
    
    const fetchRecentMints = async () => {
      if (!publicClient || !userAddress) {
        console.log("❌ Missing required data:", {
          hasPublicClient: !!publicClient,
          hasUserAddress: !!userAddress,
        })
        setIsLoading(false)
        return
      }

      try {
        console.log("🔍 Starting block number fetch...")
        const currentBlock = await publicClient.getBlockNumber()
        console.log(`✅ Current block: ${currentBlock}`)

        console.log(`🔍 Debugging Recent Activity:`)
        console.log(`Current block: ${currentBlock}`)
        console.log(`Contract address: ${rwaTokenAddress}`)
        console.log(`Filtering for user address: ${userAddress}`)
        console.log(`Token decimals: ${decimals}`)
        console.log(`Chain ID: ${chainId}`)

        // Verify contract exists
        try {
          console.log("🔍 Checking if contract exists...")
          const contractCode = await publicClient.getBytecode({
            address: rwaTokenAddress,
          })
          console.log(`📋 Contract exists: ${contractCode ? "YES" : "NO"}`)
          console.log(`📋 Contract code length: ${contractCode?.length || 0}`)
          
          if (!contractCode) {
            console.error("❌ Contract does not exist on this network!")
            setActivities([])
            setIsLoading(false)
            return
          }
        } catch (error) {
          console.error("❌ Error checking contract:", error)
          setActivities([])
          setIsLoading(false)
          return
        }

        // Find Transfer event from the ABI
        const transferEvent = erc3643ABI.abi.find(
          (item: any) => item.type === "event" && item.name === "Transfer"
        ) as any

        console.log("📋 Transfer event definition:", transferEvent)

        if (!transferEvent) {
          console.error("❌ Transfer event not found in ABI!")
          setActivities([])
          return
        }

        // Use a much more conservative approach to avoid RPC timeouts
        const chunkSize = BigInt(100) // Only search 100 blocks at a time
        const maxChunks = 1 // Only search 1 chunk (100 blocks total)
        let allTransactions: any[] = []

        for (let i = 0; i < maxChunks; i++) {
          const fromBlock = currentBlock - BigInt(i + 1) * chunkSize
          const toBlock = currentBlock - BigInt(i) * chunkSize

          console.log(
            `🔍 Chunk ${i + 1}: Searching blocks ${fromBlock} to ${toBlock}`
          )

          try {
            // Add timeout to the request with shorter timeout
            const logs = await Promise.race([
              publicClient.getLogs({
                address: rwaTokenAddress,
                event: transferEvent,
                fromBlock,
                toBlock,
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 3000) // Reduced to 3 seconds
              )
            ]) as any[]

            console.log(
              `📋 Chunk ${i + 1}: Found ${logs.length} Transfer events`
            )

            // Debug ALL transfers in first chunk to see what's happening
            if (i === 0 && logs.length > 0) {
              console.log("🔍 Detailed Transfer analysis:")
              logs.forEach((log: any, index: number) => {
                const isMint =
                  log.args.from === "0x0000000000000000000000000000000000000000"
                const isBurn =
                  log.args.to === "0x0000000000000000000000000000000000000000"
                const isToUser =
                  log.args.to?.toLowerCase() === userAddress.toLowerCase()
                const isFromUser =
                  log.args.from?.toLowerCase() === userAddress.toLowerCase()
                const isUserMint = isMint && isToUser
                const isUserBurn = isBurn && isFromUser

                let label = "🔄 REGULAR"
                if (isUserMint) label = "🎯 YOUR MINT"
                else if (isUserBurn) label = "🔥 YOUR BURN"
                else if (isMint) label = "🟢 OTHER MINT"
                else if (isBurn) label = "🔴 OTHER BURN"

                console.log(`Transfer ${index + 1} ${label}:`, {
                  from: log.args.from,
                  to: log.args.to,
                  value: log.args.value?.toString(),
                  amount: `${(Number(log.args.value) / Math.pow(10, decimals)).toFixed(2)} tokens`,
                  txHash: log.transactionHash,
                  block: log.blockNumber?.toString(),
                })
              })
            } else if (i === 0 && logs.length === 0) {
              console.log("⚠️ No Transfer events found in most recent chunk")
            }

            // Get both mints (from zero) and burns (to zero) for this user
            const chunkTransactions = logs
              .filter((log: any) => {
                const isMint =
                  log.args.from ===
                    "0x0000000000000000000000000000000000000000" &&
                  log.args.to?.toLowerCase() === userAddress.toLowerCase()
                const isBurn =
                  log.args.to ===
                    "0x0000000000000000000000000000000000000000" &&
                  log.args.from?.toLowerCase() === userAddress.toLowerCase()
                return isMint || isBurn
              })
              .map((log: any) => {
                try {
                  const price = getValidPrice(currentPrice)
                  const value = calculateValue(log.args.value, price, decimals)

                  // Use block time estimation instead of random
                  const blocksAgo = Number(currentBlock - log.blockNumber)
                  const hoursAgo = Math.floor((blocksAgo * 2) / 3600) // 2 sec per block
                  const timestamp = Date.now() - hoursAgo * 3600000

                  // Determine if this is a mint or burn
                  const isMint =
                    log.args.from ===
                    "0x0000000000000000000000000000000000000000"
                  const action = isMint ? "Purchased" : "Burned"

                  const formattedAmount = formatAmount(log.args.value, decimals)

                  return {
                    id: `${log.transactionHash}-${log.logIndex}`,
                    action,
                    symbol: "SLQD",
                    amount: formattedAmount,
                    time: getTimeAgo(timestamp),
                    value: formatCurrencyValue(value),
                    blockNumber: Number(log.blockNumber),
                    transactionType:
                      action === "Burned" ? "SLQD Sold" : "SLQD Bought",
                  }
                } catch (error) {
                  console.error("Error processing transaction:", error)
                  return {
                    id: `${log.transactionHash}-${log.logIndex}`,
                    action:
                      log.args.from ===
                      "0x0000000000000000000000000000000000000000"
                        ? "Purchased"
                        : "Burned",
                    symbol: "SLQD",
                    amount: "0",
                    time: getTimeAgo(Date.now()),
                    value: "$0",
                    blockNumber: Number(log.blockNumber),
                    transactionType:
                      log.args.from ===
                      "0x0000000000000000000000000000000000000000"
                        ? "SLQD Bought"
                        : "SLQD Sold",
                  }
                }
              })

            allTransactions.push(...chunkTransactions)
            console.log(
              `🔥 Chunk ${i + 1}: Found ${chunkTransactions.length} YOUR transactions (mints/burns) (total: ${allTransactions.length})`
            )

            // If we found transactions, we can stop searching
            if (allTransactions.length > 0) {
              console.log("✅ Found transactions, stopping search...")
              break
            }

            // Continue collecting all transactions (no early exit)
          } catch (chunkError) {
            console.error(`❌ Chunk ${i + 1} failed:`, chunkError)
            // If any chunk fails, just stop and show what we have
            console.log("⚠️ RPC timeout detected, stopping search...")
            break
          }
        }

        // If we found no transactions, show empty state
        if (allTransactions.length === 0) {
          console.log("📭 No transactions found in recent blocks")
        }

        // Sort transactions by block number (most recent first)
        allTransactions.sort((a, b) => b.blockNumber - a.blockNumber)

        console.log(
          `🎯 Total YOUR transactions (mints/burns) found: ${allTransactions.length}`
        )

        // Store all transactions and show subset
        setAllTransactions(allTransactions)
        setHasMore(allTransactions.length > showCount)
        setActivities(allTransactions.slice(0, showCount))
      } catch (error) {
        console.error("Error fetching mint events:", error)
        setActivities([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentMints()
  }, [publicClient, currentPrice, userAddress, decimals, rwaTokenAddress])

  // Update displayed activities when showCount changes
  useEffect(() => {
    if (allTransactions.length > 0) {
      setActivities(allTransactions.slice(0, showCount))
      setHasMore(allTransactions.length > showCount)
    }
  }, [showCount, allTransactions])

  const loadMore = () => {
    setShowCount((prev) => prev + 5)
  }

  return { activities, isLoading, hasMore, loadMore }
}
