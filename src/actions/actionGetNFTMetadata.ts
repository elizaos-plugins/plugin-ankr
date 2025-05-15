// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import { Action, IAgentRuntime, Memory, ActionExample } from "@elizaos/core";
import {
  AnkrProvider,
  Blockchain,
  GetNFTMetadataReply,
} from "@ankr.com/ankr.js";
import { z } from "zod";
import { ValidationError } from "../error/base";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";

// ------------------------------------------------------------------------------------------------
// Types and Schemas
// ------------------------------------------------------------------------------------------------
export const getNFTMetadataRequestSchema = z.object({
  blockchain: z
    .nativeEnum(Blockchains)
    .describe("The blockchain to get NFT metadata from"),
  contractAddress: z
    .string()
    .startsWith("0x")
    .describe("The NFT contract address"),
  tokenId: z.string().describe("The token ID of the NFT"),
});

type GetNFTMetadataRequest = z.infer<typeof getNFTMetadataRequestSchema>;

// ------------------------------------------------------------------------------------------------
// Validation Functions
// ------------------------------------------------------------------------------------------------
const validateGetNFTMetadataRequest = (
  content: unknown
): content is GetNFTMetadataRequest => {
  const result = getNFTMetadataRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

// ------------------------------------------------------------------------------------------------
// Response Formatter
// ------------------------------------------------------------------------------------------------
const formatGetNFTMetadataReply = (
  request: GetNFTMetadataRequest,
  response: GetNFTMetadataReply
): string => {
  const { metadata, attributes, syncStatus } = response;

  if (!metadata || !attributes) {
    return `No metadata found for NFT with token ID ${request.tokenId} at contract ${request.contractAddress} on ${request.blockchain}`;
  }

  // Format the response text
  let formattedText = `NFT Metadata for ${
    attributes.name || `Token #${request.tokenId}`
  }:\n\n`;

  // Collection name (try to extract from NFT name if available)
  const collectionName = attributes.name
    ? attributes.name.split("#")[0].trim()
    : metadata.collectionName || "Unknown Collection";

  formattedText += `Collection: ${collectionName}\n`;
  formattedText += `Contract: ${metadata.contractAddress.slice(
    0,
    6
  )}...${metadata.contractAddress.slice(-4)} (${metadata.contractType})\n\n`;

  if (attributes.description) {
    formattedText += `Description: ${attributes.description}\n\n`;
  }

  if (attributes.traits && attributes.traits.length > 0) {
    formattedText += "Traits:\n";
    for (const trait of attributes.traits) {
      formattedText += `- ${trait.trait_type}: ${trait.value}\n`;
    }
  }

  if (attributes.imageUrl) {
    formattedText += `\nImage URL: ${attributes.imageUrl}\n`;
  }

  if (attributes.tokenUrl) {
    formattedText += `Token URL: ${attributes.tokenUrl}\n`;
  }

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
const getNFTMetadataHandler = async (
  provider: AnkrProvider,
  request: GetNFTMetadataRequest
): Promise<GetNFTMetadataReply> => {
  return provider.getNFTMetadata({
    blockchain: request.blockchain as Blockchain,
    contractAddress: request.contractAddress,
    tokenId: request.tokenId,
    forceFetch: true,
  });
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetNFTMetadata: Action = {
  name: "GET_NFT_METADATA_ANKR",
  similes: ["GET_NFT_INFO", "SHOW_NFT_DETAILS", "VIEW_NFT", "NFT_METADATA"],
  description:
    "Get detailed metadata for a specific NFT including traits, images, and contract information.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me the metadata for NFT token 1234 at contract 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d on eth",
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
    methodName: "GetNFTMetadata",
    requestValidator: validateGetNFTMetadataRequest,
    requestSchema: getNFTMetadataRequestSchema,
    methodHandler: getNFTMetadataHandler,
    responseFormatter: formatGetNFTMetadataReply,
  }),
};

export default actionGetNFTMetadata;
