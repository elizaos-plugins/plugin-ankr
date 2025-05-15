// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import { Action, IAgentRuntime, Memory, ActionExample } from "@elizaos/core";
import {
  AnkrProvider,
  Blockchain,
  GetTokenHoldersCountReply,
  GetTokenHoldersCountRequest as AnkrGetTokenHoldersCountRequest,
} from "@ankr.com/ankr.js";
import { z } from "zod";
import { ValidationError } from "../error/base";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";

// ------------------------------------------------------------------------------------------------
// Types and Schemas
// ------------------------------------------------------------------------------------------------
export const getTokenHoldersCountRequestSchema = z.object({
  blockchain: z
    .nativeEnum(Blockchains)
    .describe("The blockchain to get token holders count for"),
  contractAddress: z
    .string()
    .startsWith("0x")
    .describe("The contract address of the token"),
});

type GetTokenHoldersCountRequest = z.infer<
  typeof getTokenHoldersCountRequestSchema
>;

/**
 * Validates the token holders count request
 */
const validateGetTokenHoldersCountRequest = (
  content: unknown
): content is GetTokenHoldersCountRequest => {
  const result = getTokenHoldersCountRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

/**
 * Formats the token holders count response into a human-readable string
 */
const formatGetTokenHoldersCountReply = (
  request: GetTokenHoldersCountRequest,
  response: GetTokenHoldersCountReply
): string => {
  // Format the response text
  let formattedText = `Token Holders Count on ${request.blockchain.toUpperCase()}:\n\n`;
  formattedText += `Current Holders: ${response.latestHoldersCount.toLocaleString()}\n\n`;
  formattedText += "Historical Data:\n";

  response.holderCountHistory.forEach((history, index: number) => {
    const date = new Date(history.lastUpdatedAt).toLocaleDateString();
    formattedText += `
${index + 1}. ${date}
   Holders: ${history.holderCount.toLocaleString()}
   Total Amount: ${Number(history.totalAmount).toLocaleString()}`;
  });

  if (response.syncStatus) {
    formattedText += `

Sync Status: ${response.syncStatus.status} (${response.syncStatus.lag})`;
  }

  return formattedText;
};

/**
 * Handles the API call to get token holders count
 */
const getTokenHoldersCountHandler = (
  provider: AnkrProvider,
  request: GetTokenHoldersCountRequest
): Promise<GetTokenHoldersCountReply> => {
  return provider.getTokenHoldersCount({
    blockchain: request.blockchain as Blockchain,
    contractAddress: request.contractAddress,
  });
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetTokenHoldersCount: Action = {
  name: "GET_TOKEN_HOLDERS_COUNT_ANKR",
  similes: [
    "COUNT_HOLDERS",
    "TOTAL_HOLDERS",
    "HOLDERS_COUNT",
    "NUMBER_OF_HOLDERS",
  ],
  description:
    "Get the total number of holders and historical data for a specific token.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "How many holders does 0xdAC17F958D2ee523a2206206994597C13D831ec7 have on eth?",
        },
      } as ActionExample,
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    message: Memory
  ): Promise<boolean> => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetTokenHoldersCount",
    requestValidator: validateGetTokenHoldersCountRequest,
    requestSchema: getTokenHoldersCountRequestSchema,
    methodHandler: getTokenHoldersCountHandler,
    responseFormatter: formatGetTokenHoldersCountReply,
  }),
};

export default actionGetTokenHoldersCount;
