// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import { Action, IAgentRuntime, Memory } from "@elizaos/core";
// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import {
  AnkrProvider,
  Blockchain,
  GetBlockchainStatsReply,
} from "@ankr.com/ankr.js";
import { z } from "zod";
import { ValidationError } from "../error/base";
import {
  blockchains,
  blockchainInfoMap,
  Blockchains,
} from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";

// ------------------------------------------------------------------------------------------------
// Types and Schemas
// ------------------------------------------------------------------------------------------------
export const getBlockchainStatsRequestSchema = z.object({
  blockchain: z
    .nativeEnum(Blockchains)
    .describe("The blockchain to get statistics for"),
});

type GetBlockchainStatsRequest = z.infer<
  typeof getBlockchainStatsRequestSchema
>;

/**
 * Validates the blockchain stats request
 */
const validateGetBlockchainStatsRequest = (
  content: unknown
): content is GetBlockchainStatsRequest => {
  const result = getBlockchainStatsRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

/**
 * Formats the blockchain stats response into a human-readable string
 */
const formatGetBlockchainStatsReply = (
  request: GetBlockchainStatsRequest,
  response: GetBlockchainStatsReply
): string => {
  // The response contains an array of stats, but we only requested one blockchain
  const stats = response.stats[0];

  // Get the full blockchain name from the mapping
  const blockchainInfo = blockchainInfoMap[request.blockchain];
  const blockchainName = blockchainInfo
    ? blockchainInfo.fullName
    : request.blockchain;

  const formattedText =
    `Blockchain Statistics for ${blockchainName} (${request.blockchain}):\n\n` +
    `Latest Block: ${stats.latestBlockNumber.toLocaleString()}\n` +
    `Total Transactions: ${stats.totalTransactionsCount.toLocaleString()}\n` +
    `Total Events: ${stats.totalEventsCount.toLocaleString()}\n` +
    `Block Time: ${(stats.blockTimeMs / 1000).toFixed(2)} seconds\n` +
    `Native Coin Price: $${Number.parseFloat(stats.nativeCoinUsdPrice).toFixed(
      2
    )} USD`;

  return formattedText;
};

/**
 * Handles the API call to get blockchain stats
 */
const getBlockchainStatsHandler = async (
  provider: AnkrProvider,
  request: GetBlockchainStatsRequest
): Promise<GetBlockchainStatsReply> => {
  return provider.getBlockchainStats({
    blockchain: request.blockchain as Blockchain,
  });
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetBlockchainStats: Action = {
  name: "GET_BLOCKCHAIN_STATS_ANKR",
  similes: [
    "BLOCKCHAIN_STATS",
    "CHAIN_STATS",
    "NETWORK_STATS",
    "BLOCKCHAIN_METRICS",
  ],
  description:
    "Retrieve statistics about a blockchain such as latest block, transaction count, and more.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me the stats for the Ethereum blockchain",
        },
      },
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    message: Memory
  ): Promise<boolean> => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetBlockchainStats",
    requestValidator: validateGetBlockchainStatsRequest,
    requestSchema: getBlockchainStatsRequestSchema,
    methodHandler: getBlockchainStatsHandler,
    responseFormatter: formatGetBlockchainStatsReply,
  }),
};

export default actionGetBlockchainStats;
