// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import { Action, IAgentRuntime, Memory, ActionExample } from "@elizaos/core";
import {
  AnkrProvider,
  Blockchain,
  GetTransactionsByAddressReply,
  GetTransactionsByAddressRequest,
} from "@ankr.com/ankr.js";
import { z } from "zod";
import { ValidationError } from "../error/base";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";

// ------------------------------------------------------------------------------------------------
// Types and Schemas
// ------------------------------------------------------------------------------------------------
export const getTransactionsByAddressRequestSchema = z.object({
  blockchain: z
    .nativeEnum(Blockchains)
    .describe("The blockchain to get transactions from"),
  address: z
    .string()
    .startsWith("0x")
    .describe("The wallet address to get transactions for"),
  includeLogs: z
    .boolean()
    .default(true)
    .describe("Whether to include transaction logs"),
  descOrder: z
    .boolean()
    .default(true)
    .describe("Whether to sort transactions in descending order"),
});

type GetTransactionsByAddressRequestType = z.infer<
  typeof getTransactionsByAddressRequestSchema
>;

// ------------------------------------------------------------------------------------------------
// Validation Functions
// ------------------------------------------------------------------------------------------------
const validateGetTransactionsByAddressRequest = (
  content: unknown
): content is GetTransactionsByAddressRequestType => {
  const result = getTransactionsByAddressRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

// ------------------------------------------------------------------------------------------------
// Response Formatter
// ------------------------------------------------------------------------------------------------
const formatGetTransactionsByAddressReply = (
  request: GetTransactionsByAddressRequestType,
  response: GetTransactionsByAddressReply
): string => {
  const { transactions, syncStatus } = response;

  // Format the response text
  let formattedText = `Transactions for ${request.address} on ${request.blockchain}:\n\n`;

  if (transactions.length === 0) {
    formattedText += "No transactions found";
    return formattedText;
  }

  transactions.forEach((tx, index) => {
    const date = new Date(Number(tx.timestamp) * 1000).toLocaleString();
    const value = Number(tx.value) / 1e18;
    const status = tx.status === "0x1" ? "Success" : "Failed";

    formattedText += `${index + 1}. Transaction\n`;
    formattedText += `   Hash: ${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}\n`;
    formattedText += `   From: ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}\n`;

    if (tx.to) {
      formattedText += `   To: ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}\n`;
    } else if (tx.contractAddress) {
      formattedText += `   Contract Created: ${tx.contractAddress.slice(
        0,
        6
      )}...${tx.contractAddress.slice(-4)}\n`;
    }

    formattedText += `   Value: ${value.toFixed(4)} ${
      request.blockchain === "eth" ? "ETH" : "native tokens"
    }\n`;
    formattedText += `   Status: ${status}\n`;
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
const getTransactionsByAddressHandler = async (
  provider: AnkrProvider,
  request: GetTransactionsByAddressRequestType
): Promise<GetTransactionsByAddressReply> => {
  return provider.getTransactionsByAddress({
    blockchain: request.blockchain as Blockchain,
    address: [request.address],
    includeLogs: request.includeLogs,
    descOrder: request.descOrder,
    pageSize: 10,
  });
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetTransactionsByAddress: Action = {
  name: "GET_TRANSACTIONS_BY_ADDRESS_ANKR",
  similes: ["LIST_TXS", "SHOW_TXS", "VIEW_TRANSACTIONS", "GET_ADDRESS_TXS"],
  description: "Get transactions for a specific address on the blockchain",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me the latest transactions for address 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 on eth",
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
    methodName: "GetTransactionsByAddress",
    requestValidator: validateGetTransactionsByAddressRequest,
    requestSchema: getTransactionsByAddressRequestSchema,
    methodHandler: getTransactionsByAddressHandler,
    responseFormatter: formatGetTransactionsByAddressReply,
  }),
};

export default actionGetTransactionsByAddress;
