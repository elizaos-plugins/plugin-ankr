// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import { Action, IAgentRuntime, Memory, ActionExample } from "@elizaos/core";
import {
  AnkrProvider,
  Blockchain,
  GetNFTHoldersReply,
} from "@ankr.com/ankr.js";
import { z } from "zod";
import { ValidationError } from "../error/base";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";

// ------------------------------------------------------------------------------------------------
// Types and Schemas
// ------------------------------------------------------------------------------------------------
export const getNFTHoldersRequestSchema = z.object({
  blockchain: z
    .nativeEnum(Blockchains)
    .default(Blockchains.ETH)
    .describe("The blockchain to get NFT holders from"),
  contractAddress: z
    .string()
    .startsWith("0x")
    .describe("The NFT contract address to get holders for"),
});

type GetNFTHoldersRequest = z.infer<typeof getNFTHoldersRequestSchema>;

// ------------------------------------------------------------------------------------------------
// Validation Functions
// ------------------------------------------------------------------------------------------------
const validateGetNFTHoldersRequest = (
  content: unknown
): content is GetNFTHoldersRequest => {
  const result = getNFTHoldersRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

// ------------------------------------------------------------------------------------------------
// Response Formatter
// ------------------------------------------------------------------------------------------------
const formatGetNFTHoldersReply = (
  request: GetNFTHoldersRequest,
  response: GetNFTHoldersReply
): string => {
  const { holders, syncStatus } = response;

  // Format the response text
  let formattedText = `NFT Holders for contract ${request.contractAddress} on ${request.blockchain}:\n\n`;

  if (holders.length === 0) {
    formattedText += "No holders found for this NFT contract";
    return formattedText;
  }

  formattedText += `Total Holders: ${holders.length}\n\n`;

  holders.forEach((holderAddress, index) => {
    formattedText += `${index + 1}. ${holderAddress}\n`;
  });

  if (syncStatus) {
    formattedText += `\nSync Status: ${syncStatus.status} (lag: ${syncStatus.lag})\n`;
    formattedText += `Last Update: ${new Date(
      syncStatus.timestamp * 1000
    ).toLocaleString()}`;
  }

  return formattedText;
};

// ------------------------------------------------------------------------------------------------
// API Method Handler
// ------------------------------------------------------------------------------------------------
const getNFTHoldersHandler = async (
  provider: AnkrProvider,
  request: GetNFTHoldersRequest
): Promise<GetNFTHoldersReply> => {
  return provider.getNFTHolders({
    blockchain: request.blockchain as Blockchain,
    contractAddress: request.contractAddress,
    pageSize: 10,
  });
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetNFTHolders: Action = {
  name: "GET_NFT_HOLDERS_ANKR",
  similes: [
    "FETCH_NFT_HOLDERS",
    "SHOW_NFT_HOLDERS",
    "VIEW_NFT_HOLDERS",
    "LIST_NFT_HOLDERS",
  ],
  description:
    "Retrieve holders of specific NFTs on specified blockchain networks.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me holders of NFT contract 0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258 on bsc",
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
    methodName: "GetNFTHolders",
    requestValidator: validateGetNFTHoldersRequest,
    requestSchema: getNFTHoldersRequestSchema,
    methodHandler: getNFTHoldersHandler,
    responseFormatter: formatGetNFTHoldersReply,
  }),
};

export default actionGetNFTHolders;
