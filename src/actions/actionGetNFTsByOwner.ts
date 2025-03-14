// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import {
  AnkrProvider,
  Blockchain,
  GetNFTsByOwnerReply,
} from "@ankr.com/ankr.js";
import { Action, ActionExample, IAgentRuntime, Memory } from "@elizaos/core";
import { z } from "zod";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";
import { ValidationError } from "../error/base";

// ------------------------------------------------------------------------------------------------
// Types and Schemas
// ------------------------------------------------------------------------------------------------
export const getNFTsByOwnerRequestSchema = z.object({
  blockchain: z
    .union([z.nativeEnum(Blockchains), z.array(z.nativeEnum(Blockchains))])
    .optional()
    .describe("The blockchain(s) to get NFTs from"),
  walletAddress: z
    .string()
    .startsWith("0x")
    .describe("The wallet address to get NFTs for"),
});

type GetNFTsByOwnerRequestType = z.infer<typeof getNFTsByOwnerRequestSchema>;

// ------------------------------------------------------------------------------------------------
// Validation Functions
// ------------------------------------------------------------------------------------------------
const validateGetNFTsByOwnerRequest = (
  content: unknown
): content is GetNFTsByOwnerRequestType => {
  const result = getNFTsByOwnerRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

// ------------------------------------------------------------------------------------------------
// Response Formatter
// ------------------------------------------------------------------------------------------------
const formatGetNFTsByOwnerReply = (
  request: GetNFTsByOwnerRequestType,
  response: GetNFTsByOwnerReply
): string => {
  const { assets, syncStatus } = response;

  // Format the response text
  let formattedText = `NFTs owned by ${request.walletAddress}:\n\n`;

  if (assets.length === 0) {
    formattedText += "No NFTs found";
    return formattedText;
  }

  assets.forEach((nft, index) => {
    formattedText += `${index + 1}. ${nft.name || "Unnamed NFT"}\n`;
    formattedText += `   Collection: ${
      nft.collectionName || "Unknown Collection"
    }\n`;
    formattedText += `   Token ID: ${nft.tokenId}\n`;
    formattedText += `   Blockchain: ${nft.blockchain}\n`;
    formattedText += `   Contract: ${nft.contractAddress.slice(
      0,
      6
    )}...${nft.contractAddress.slice(-4)}\n`;

    if (nft.quantity && nft.quantity !== "1") {
      formattedText += `   Quantity: ${nft.quantity}\n`;
    }

    formattedText += `   Type: ${nft.contractType}\n\n`;
  });

  if (syncStatus) {
    formattedText += `Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})`;
  }

  return formattedText;
};

// ------------------------------------------------------------------------------------------------
// API Method Handler
// ------------------------------------------------------------------------------------------------
const getNFTsByOwnerHandler = async (
  provider: AnkrProvider,
  request: GetNFTsByOwnerRequestType
): Promise<GetNFTsByOwnerReply> => {
  return provider.getNFTsByOwner({
    blockchain: request.blockchain as Blockchain | Blockchain[],
    walletAddress: request.walletAddress,
    pageSize: 10,
  });
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetNFTsByOwner: Action = {
  name: "GET_NFTS_BY_OWNER_ANKR",
  similes: [
    "LIST_NFTS",
    "SHOW_NFTS",
    "VIEW_NFTS",
    "FETCH_NFTS",
    "GET_OWNED_NFTS",
  ],
  description:
    "Get NFTs owned by a specific wallet address across multiple blockchains",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me the NFTs owned by 0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
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
    methodName: "GetNFTsByOwner",
    requestValidator: validateGetNFTsByOwnerRequest,
    requestSchema: getNFTsByOwnerRequestSchema,
    methodHandler: getNFTsByOwnerHandler,
    responseFormatter: formatGetNFTsByOwnerReply,
  }),
};

export default actionGetNFTsByOwner;
