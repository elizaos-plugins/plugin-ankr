// Define blockchain enum first
export enum Blockchains {
  // Mainnets
  ARBITRUM = "arbitrum",
  AVALANCHE = "avalanche",
  BASE = "base",
  BSC = "bsc",
  ETH = "eth",
  FANTOM = "fantom",
  FLARE = "flare",
  GNOSIS = "gnosis",
  LINEA = "linea",
  OPTIMISM = "optimism",
  POLYGON = "polygon",
  POLYGON_ZKEVM = "polygon_zkevm",
  ROLLUX = "rollux",
  SCROLL = "scroll",
  SYSCOIN = "syscoin",
  TELOS = "telos",
  XAI = "xai",
  XLAYER = "xlayer",
  STORY_MAINNET = "story_mainnet",

  // Testnets
  AVALANCHE_FUJI = "avalanche_fuji",
  BASE_SEPOLIA = "base_sepolia",
  ETH_HOLESKY = "eth_holesky",
  ETH_SEPOLIA = "eth_sepolia",
  OPTIMISM_TESTNET = "optimism_testnet",
  POLYGON_AMOY = "polygon_amoy",
  STORY_TESTNET = "story_testnet",
}

// Export the array of blockchain values for Zod compatibility
export const blockchains = Object.values(Blockchains) as readonly string[];

// Define the BlockchainTag type
export type BlockchainTag = Blockchains;

// Define the blockchain info map using the enum
export const blockchainInfoMap: Record<
  Blockchains,
  { tag: Blockchains; fullName: string; isTestnet?: boolean }
> = {
  // Mainnets
  [Blockchains.ARBITRUM]: { tag: Blockchains.ARBITRUM, fullName: "Arbitrum" },
  [Blockchains.AVALANCHE]: {
    tag: Blockchains.AVALANCHE,
    fullName: "Avalanche",
  },
  [Blockchains.BASE]: { tag: Blockchains.BASE, fullName: "Base" },
  [Blockchains.BSC]: { tag: Blockchains.BSC, fullName: "Binance Smart Chain" },
  [Blockchains.ETH]: { tag: Blockchains.ETH, fullName: "Ethereum" },
  [Blockchains.FANTOM]: { tag: Blockchains.FANTOM, fullName: "Fantom" },
  [Blockchains.FLARE]: { tag: Blockchains.FLARE, fullName: "Flare" },
  [Blockchains.GNOSIS]: { tag: Blockchains.GNOSIS, fullName: "Gnosis" },
  [Blockchains.LINEA]: { tag: Blockchains.LINEA, fullName: "Linea" },
  [Blockchains.OPTIMISM]: { tag: Blockchains.OPTIMISM, fullName: "Optimism" },
  [Blockchains.POLYGON]: { tag: Blockchains.POLYGON, fullName: "Polygon" },
  [Blockchains.POLYGON_ZKEVM]: {
    tag: Blockchains.POLYGON_ZKEVM,
    fullName: "Polygon zkEVM",
  },
  [Blockchains.ROLLUX]: { tag: Blockchains.ROLLUX, fullName: "Rollux" },
  [Blockchains.SCROLL]: { tag: Blockchains.SCROLL, fullName: "Scroll" },
  [Blockchains.SYSCOIN]: { tag: Blockchains.SYSCOIN, fullName: "Syscoin" },
  [Blockchains.TELOS]: { tag: Blockchains.TELOS, fullName: "Telos" },
  [Blockchains.XAI]: { tag: Blockchains.XAI, fullName: "Xai" },
  [Blockchains.XLAYER]: { tag: Blockchains.XLAYER, fullName: "XLayer" },
  [Blockchains.STORY_MAINNET]: {
    tag: Blockchains.STORY_MAINNET,
    fullName: "Story",
  },

  // Testnets
  [Blockchains.AVALANCHE_FUJI]: {
    tag: Blockchains.AVALANCHE_FUJI,
    fullName: "Avalanche Fuji",
    isTestnet: true,
  },
  [Blockchains.BASE_SEPOLIA]: {
    tag: Blockchains.BASE_SEPOLIA,
    fullName: "Base Sepolia",
    isTestnet: true,
  },
  [Blockchains.ETH_HOLESKY]: {
    tag: Blockchains.ETH_HOLESKY,
    fullName: "Ethereum Holesky",
    isTestnet: true,
  },
  [Blockchains.ETH_SEPOLIA]: {
    tag: Blockchains.ETH_SEPOLIA,
    fullName: "Ethereum Sepolia",
    isTestnet: true,
  },
  [Blockchains.OPTIMISM_TESTNET]: {
    tag: Blockchains.OPTIMISM_TESTNET,
    fullName: "Optimism Testnet",
    isTestnet: true,
  },
  [Blockchains.POLYGON_AMOY]: {
    tag: Blockchains.POLYGON_AMOY,
    fullName: "Polygon Amoy",
    isTestnet: true,
  },
  [Blockchains.STORY_TESTNET]: {
    tag: Blockchains.STORY_TESTNET,
    fullName: "Story Testnet",
    isTestnet: true,
  },
};

// Helper function to get blockchain tag from full name (case insensitive)
export function getBlockchainTagFromName(
  name: string
): BlockchainTag | undefined {
  const normalizedName = name.toLowerCase().trim();

  // Direct match with tag
  const directMatch = Object.values(Blockchains).find(
    (value) => value.toLowerCase() === normalizedName
  );
  if (directMatch) {
    return directMatch as BlockchainTag;
  }

  // Match with full name
  const entry = Object.entries(blockchainInfoMap).find(
    ([_, info]) => info.fullName.toLowerCase() === normalizedName
  );

  return entry?.[0] as BlockchainTag | undefined;
}

// Helper function to check if a blockchain is a testnet
export function isTestnet(blockchain: BlockchainTag): boolean {
  return !!blockchainInfoMap[blockchain]?.isTestnet;
}
