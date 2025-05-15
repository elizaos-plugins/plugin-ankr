// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import { Action, IAgentRuntime, Memory, ActionExample } from "@elizaos/core";
import {
  AnkrProvider,
  Blockchain,
  GetTokenTransfersReply,
  GetTransfersRequest,
} from "@ankr.com/ankr.js";
import { z } from "zod";
import { ValidationError } from "../error/base";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";

// ------------------------------------------------------------------------------------------------
// Types and Schemas
// ------------------------------------------------------------------------------------------------
export const getTokenTransfersRequestSchema = z.object({
  blockchain: z
    .nativeEnum(Blockchains)
    .describe("The blockchain to get token transfers from"),
  address: z
    .string()
    .startsWith("0x")
    .describe("The wallet address to get token transfers for"),
  contractAddress: z
    .string()
    .refine((val) => !val || val.startsWith("0x"), {
      message: "Contract address must be empty or start with 0x",
    })
    .optional()
    .describe("The token contract address (optional)"),
  fromTimestamp: z
    .number()
    .optional()
    .describe("Start timestamp for the transfers (optional)"),
  toTimestamp: z
    .number()
    .optional()
    .describe("End timestamp for the transfers (optional)"),
  descOrder: z
    .boolean()
    .default(true)
    .describe("Whether to sort transfers in descending order"),
});

type GetTokenTransfersRequestType = z.infer<
  typeof getTokenTransfersRequestSchema
>;

// ------------------------------------------------------------------------------------------------
// Validation Functions
// ------------------------------------------------------------------------------------------------
const validateGetTokenTransfersRequest = (
  content: unknown
): content is GetTokenTransfersRequestType => {
  const result = getTokenTransfersRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

// ------------------------------------------------------------------------------------------------
// Response Formatter
// ------------------------------------------------------------------------------------------------
const formatGetTokenTransfersReply = (
  request: GetTokenTransfersRequestType,
  response: GetTokenTransfersReply
): string => {
  const { transfers, syncStatus } = response;

  // Format the response text
  let formattedText = `Token transfers for ${request.address} on ${request.blockchain}:\n\n`;

  if (transfers.length === 0) {
    formattedText += "No token transfers found";
    return formattedText;
  }

  transfers.forEach((transfer, index) => {
    const date = new Date(transfer.timestamp * 1000).toLocaleString();
    const value = Number(transfer.value);

    formattedText += `${index + 1}. ${transfer.tokenName} (${
      transfer.tokenSymbol
    })\n`;

    if (transfer.fromAddress === request.address) {
      formattedText += `   Sent: ${value} ${transfer.tokenSymbol}\n`;
      formattedText += `   To: ${transfer.toAddress.slice(
        0,
        6
      )}...${transfer.toAddress.slice(-4)}\n`;
    } else {
      formattedText += `   Received: ${value} ${transfer.tokenSymbol}\n`;
      formattedText += `   From: ${transfer.fromAddress.slice(
        0,
        6
      )}...${transfer.fromAddress.slice(-4)}\n`;
    }

    formattedText += `   Contract: ${transfer.contractAddress.slice(
      0,
      6
    )}...${transfer.contractAddress.slice(-4)}\n`;
    formattedText += `   Tx Hash: ${transfer.transactionHash.slice(
      0,
      6
    )}...${transfer.transactionHash.slice(-4)}\n`;
    formattedText += `   Time: ${date}\n\n`;
  });

  if (syncStatus) {
    formattedText += `Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})`;
  }

  return formattedText;
};

// ------------------------------------------------------------------------------------------------
// API Method Handler
// ------------------------------------------------------------------------------------------------
const getTokenTransfersHandler = async (
  provider: AnkrProvider,
  request: GetTokenTransfersRequestType
): Promise<GetTokenTransfersReply> => {
  const params: GetTransfersRequest = {
    blockchain: request.blockchain as Blockchain,
    address: [request.address],
    descOrder: request.descOrder,
    pageSize: 10,
  };

  if (request.fromTimestamp) {
    params.fromTimestamp = request.fromTimestamp;
  }

  if (request.toTimestamp) {
    params.toTimestamp = request.toTimestamp;
  }

  return provider.getTokenTransfers(params);
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetTokenTransfers: Action = {
  name: "GET_TOKEN_TRANSFERS_ANKR",
  similes: [
    "FETCH_TOKEN_TRANSFERS",
    "SHOW_TOKEN_TRANSFERS",
    "VIEW_TOKEN_TRANSFERS",
    "LIST_TOKEN_TRANSFERS",
  ],
  description:
    "Retrieve token transfer history for a specific address on the blockchain",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me token transfers for address 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 on eth",
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
    methodName: "GetTokenTransfers",
    requestValidator: validateGetTokenTransfersRequest,
    requestSchema: getTokenTransfersRequestSchema,
    methodHandler: getTokenTransfersHandler,
    responseFormatter: formatGetTokenTransfersReply,
  }),
};

export default actionGetTokenTransfers;
