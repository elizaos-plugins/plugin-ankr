// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import { Action, IAgentRuntime, Memory, ActionExample } from "@elizaos/core";
import {
  AnkrProvider,
  Blockchain,
  GetNftTransfersReply,
} from "@ankr.com/ankr.js";
import { z } from "zod";
import { ValidationError } from "../error/base";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";

// ------------------------------------------------------------------------------------------------
// Types and Schemas
// ------------------------------------------------------------------------------------------------
export const getNFTTransfersRequestSchema = z.object({
  blockchain: z
    .nativeEnum(Blockchains)
    .describe("The blockchain to get NFT transfers from"),
  contractAddress: z
    .string()
    .refine((val) => !val || val.startsWith("0x"), {
      message: "Contract address must be empty or start with 0x",
    })
    .optional()
    .describe("The NFT contract address (optional)"),
  fromAddress: z
    .string()
    .refine((val) => !val || val.startsWith("0x"), {
      message: "From address must be empty or start with 0x",
    })
    .optional()
    .describe("The sender address (optional)"),
  toAddress: z
    .string()
    .refine((val) => !val || val.startsWith("0x"), {
      message: "To address must be empty or start with 0x",
    })
    .optional()
    .describe("The recipient address (optional)"),
  fromTimestamp: z
    .number()
    .optional()
    .describe("Start timestamp for the transfers (optional)"),
  toTimestamp: z
    .number()
    .optional()
    .describe("End timestamp for the transfers (optional)"),
});

type GetNFTTransfersRequest = z.infer<typeof getNFTTransfersRequestSchema>;

// ------------------------------------------------------------------------------------------------
// Validation Functions
// ------------------------------------------------------------------------------------------------
const validateGetNFTTransfersRequest = (
  content: unknown
): content is GetNFTTransfersRequest => {
  const result = getNFTTransfersRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }

  // At least one of contractAddress, fromAddress, or toAddress must be provided
  const typedContent = content as GetNFTTransfersRequest;
  if (
    !typedContent.contractAddress &&
    !typedContent.fromAddress &&
    !typedContent.toAddress
  ) {
    throw new ValidationError(
      "At least one of contractAddress, fromAddress, or toAddress must be provided"
    );
  }

  return true;
};

// ------------------------------------------------------------------------------------------------
// Response Formatter
// ------------------------------------------------------------------------------------------------
const formatGetNFTTransfersReply = (
  request: GetNFTTransfersRequest,
  response: GetNftTransfersReply
): string => {
  const { transfers, syncStatus } = response;

  // Format the response text
  let formattedText = `NFT Transfers on ${request.blockchain}:\n\n`;

  if (request.contractAddress) {
    formattedText += `Contract: ${request.contractAddress}\n\n`;
  }

  if (request.fromAddress) {
    formattedText += `From Address: ${request.fromAddress}\n\n`;
  }

  if (request.toAddress) {
    formattedText += `To Address: ${request.toAddress}\n\n`;
  }

  if (transfers.length === 0) {
    formattedText += "No NFT transfers found";
    return formattedText;
  }

  transfers.forEach((transfer, index) => {
    const date = new Date(transfer.timestamp * 1000).toLocaleString();

    formattedText += `${index + 1}. ${transfer.collectionName || "NFT"} (ID: ${
      transfer.tokenId || "Unknown"
    })\n`;
    formattedText += `   From: ${transfer.fromAddress.slice(
      0,
      6
    )}...${transfer.fromAddress.slice(-4)}\n`;
    formattedText += `   To: ${transfer.toAddress.slice(
      0,
      6
    )}...${transfer.toAddress.slice(-4)}\n`;
    formattedText += `   Contract: ${transfer.contractAddress.slice(
      0,
      6
    )}...${transfer.contractAddress.slice(-4)}\n`;
    formattedText += `   Type: ${transfer.type}\n`;
    formattedText += `   Tx Hash: ${transfer.transactionHash.slice(
      0,
      6
    )}...${transfer.transactionHash.slice(-4)}\n`;
    formattedText += `   Time: ${date}\n\n`;
  });

  if (syncStatus) {
    formattedText += `Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})\n`;
    formattedText += `Last Update: ${new Date(
      syncStatus.timestamp * 1000
    ).toLocaleString()}`;
  }

  return formattedText;
};

// ------------------------------------------------------------------------------------------------
// API Method Handler
// ------------------------------------------------------------------------------------------------
const getNFTTransfersHandler = async (
  provider: AnkrProvider,
  request: GetNFTTransfersRequest
): Promise<GetNftTransfersReply> => {
  const params: any = {
    blockchain: request.blockchain as Blockchain,
    pageSize: 10,
  };

  if (request.contractAddress) {
    params.contractAddress = request.contractAddress;
  }

  if (request.fromAddress) {
    params.fromAddress = request.fromAddress;
  }

  if (request.toAddress) {
    params.toAddress = request.toAddress;
  }

  if (request.fromTimestamp) {
    params.fromTimestamp = request.fromTimestamp;
  }

  if (request.toTimestamp) {
    params.toTimestamp = request.toTimestamp;
  }

  return provider.getNftTransfers(params);
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetNFTTransfers: Action = {
  name: "GET_NFT_TRANSFERS_ANKR",
  similes: [
    "FETCH_NFT_TRANSFERS",
    "SHOW_NFT_TRANSFERS",
    "VIEW_NFT_TRANSFERS",
    "LIST_NFT_TRANSFERS",
  ],
  description:
    "Retrieve NFT transfer history on specified blockchain networks.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me NFT transfers for contract 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d on eth",
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
    methodName: "GetNFTTransfers",
    requestValidator: validateGetNFTTransfersRequest,
    requestSchema: getNFTTransfersRequestSchema,
    methodHandler: getNFTTransfersHandler,
    responseFormatter: formatGetNFTTransfersReply,
  }),
};

export default actionGetNFTTransfers;
