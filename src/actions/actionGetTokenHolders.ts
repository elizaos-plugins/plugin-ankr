// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import { Action, IAgentRuntime, Memory, ActionExample } from "@elizaos/core";
import {
  AnkrProvider,
  Blockchain,
  GetTokenHoldersReply,
  GetTokenHoldersRequest as AnkrGetTokenHoldersRequest,
} from "@ankr.com/ankr.js";
import { z } from "zod";
import { ValidationError } from "../error/base";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";

// ------------------------------------------------------------------------------------------------
// Types and Schemas
// ------------------------------------------------------------------------------------------------
export const getTokenHoldersRequestSchema = z.object({
  blockchain: z
    .nativeEnum(Blockchains)
    .describe("The blockchain to get token holders for"),
  contractAddress: z
    .string()
    .startsWith("0x")
    .describe("The contract address of the token"),
});

type GetTokenHoldersRequest = z.infer<typeof getTokenHoldersRequestSchema>;

/**
 * Validates the token holders request
 */
const validateGetTokenHoldersRequest = (
  content: unknown
): content is GetTokenHoldersRequest => {
  const result = getTokenHoldersRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

/**
 * Formats the token holders response into a human-readable string
 */
const formatGetTokenHoldersReply = (
  request: GetTokenHoldersRequest,
  response: GetTokenHoldersReply
): string => {
  // Format the response text
  let formattedText = `Token Holders on ${request.blockchain.toUpperCase()}:\n`;
  formattedText += `Total Holders: ${response.holdersCount.toLocaleString()}\n\n`;

  response.holders.forEach((holder, index: number) => {
    const balance = Number(holder.balance).toLocaleString();
    formattedText += `${index + 1}. ${holder.holderAddress.slice(
      0,
      6
    )}...${holder.holderAddress.slice(-4)}\n`;
    formattedText += `   Balance: ${balance}\n\n`;
  });

  if (response.syncStatus) {
    formattedText += `\nSync Status: ${response.syncStatus.status} (${response.syncStatus.lag})\n`;
  }

  return formattedText;
};

/**
 * Handles the API call to get token holders
 */
const getTokenHoldersHandler = (
  provider: AnkrProvider,
  request: GetTokenHoldersRequest
): Promise<GetTokenHoldersReply> => {
  return provider.getTokenHolders({
    blockchain: request.blockchain as Blockchain,
    contractAddress: request.contractAddress,
  });
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetTokenHolders: Action = {
  name: "GET_TOKEN_HOLDERS_ANKR",
  similes: ["LIST_HOLDERS", "SHOW_HOLDERS", "TOKEN_HOLDERS", "FIND_HOLDERS"],
  description:
    "Get a list of token holders for any ERC20 or ERC721 token contract.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me holders for contract 0xf307910A4c7bbc79691fD374889b36d8531B08e3 on bsc",
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
    methodName: "GetTokenHolders",
    requestValidator: validateGetTokenHoldersRequest,
    requestSchema: getTokenHoldersRequestSchema,
    methodHandler: getTokenHoldersHandler,
    responseFormatter: formatGetTokenHoldersReply,
  }),
};

export default actionGetTokenHolders;
