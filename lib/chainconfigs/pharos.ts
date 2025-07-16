// Pharos testnet chain config for wagmi/rainbowkit
export const pharos = {
  id: 688688,
  name: "Pharos",
  network: "pharos",
  nativeCurrency: {
    name: "Pharos Token",
    symbol: "PHAR",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://testnet.dplabs-internal.com"] },
    public: { http: ["https://testnet.dplabs-internal.com"] },
  },
  blockExplorers: {
    default: { name: "PharosScan", url: "https://testnet.pharosscan.xyz" },
  },
  testnet: true,
} as const
