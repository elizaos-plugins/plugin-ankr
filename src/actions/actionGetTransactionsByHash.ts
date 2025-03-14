// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import { Action, IAgentRuntime, Memory, ActionExample } from "@elizaos/core";
import {
  AnkrProvider,
  Blockchain,
  GetTransactionsByHashReply,
} from "@ankr.com/ankr.js";
import { z } from "zod";
import { ValidationError } from "../error/base";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";

// ------------------------------------------------------------------------------------------------
// Types and Schemas
// ------------------------------------------------------------------------------------------------
export const getTransactionsByHashRequestSchema = z.object({
  blockchain: z
    .nativeEnum(Blockchains)
    .optional()
    .describe("The blockchain to get transaction from (optional)"),
  transactionHash: z
    .string()
    .startsWith("0x")
    .describe("The transaction hash to look up"),
  includeLogs: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to include transaction logs"),
});

type GetTransactionsByHashRequest = z.infer<
  typeof getTransactionsByHashRequestSchema
>;

// ------------------------------------------------------------------------------------------------
// Validation Functions
// ------------------------------------------------------------------------------------------------
const validateGetTransactionsByHashRequest = (
  content: unknown
): content is GetTransactionsByHashRequest => {
  const result = getTransactionsByHashRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

// ------------------------------------------------------------------------------------------------
// Response Formatter
// ------------------------------------------------------------------------------------------------
const formatGetTransactionsByHashReply = (
  request: GetTransactionsByHashRequest,
  response: GetTransactionsByHashReply
): string => {
  const { transactions, syncStatus } = response;

  // Format the response text
  let formattedText = `Transaction details for hash ${request.transactionHash}:\n\n`;

  if (transactions.length === 0) {
    formattedText += "No transaction found with this hash";
    return formattedText;
  }

  transactions.forEach((tx, index) => {
    formattedText += `Transaction #${index + 1}:\n`;
    formattedText += `Blockchain: ${tx.blockchain || "Unknown"}\n`;
    formattedText += `Hash: ${tx.hash || request.transactionHash}\n`;
    formattedText += `Block: ${tx.blockNumber}\n`;
    formattedText += `From: ${tx.from}\n`;

    if (tx.to) {
      formattedText += `To: ${tx.to}\n`;
    } else if (tx.contractAddress) {
      formattedText += `Contract Created: ${tx.contractAddress}\n`;
    }

    formattedText += `Value: ${tx.value}\n`;

    if (tx.gas) {
      formattedText += `Gas Limit: ${tx.gas}\n`;
    }

    if (tx.gasUsed) {
      formattedText += `Gas Used: ${tx.gasUsed}\n`;
    }

    if (tx.gasPrice) {
      formattedText += `Gas Price: ${tx.gasPrice}\n`;
    }

    if (tx.status) {
      formattedText += `Status: ${tx.status === "1" ? "Success" : "Failed"}\n`;
    }

    if (tx.timestamp) {
      const date = new Date(Number(tx.timestamp) * 1000).toLocaleString();
      formattedText += `Time: ${date}\n`;
    }

    if (request.includeLogs && tx.logs && tx.logs.length > 0) {
      formattedText += `\nLogs (${tx.logs.length}):\n`;
      tx.logs.forEach((log, logIndex) => {
        formattedText += `  Log #${logIndex + 1}:\n`;
        formattedText += `    Address: ${log.address}\n`;
        formattedText += `    Topics: ${log.topics.join(", ")}\n`;

        if (log.event) {
          formattedText += `    Event: ${log.event.name}\n`;
          if (log.event.inputs && log.event.inputs.length > 0) {
            formattedText += `    Inputs:\n`;
            log.event.inputs.forEach((input) => {
              formattedText += `      ${input.name} (${input.type}): ${input.valueDecoded}\n`;
            });
          }
        }
      });
    }

    formattedText += "\n";
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
const getTransactionsByHashHandler = async (
  provider: AnkrProvider,
  request: GetTransactionsByHashRequest
): Promise<GetTransactionsByHashReply> => {
  return provider.getTransactionsByHash({
    transactionHash: request.transactionHash,
    ...(request.blockchain && { blockchain: request.blockchain as Blockchain }),
    includeLogs: request.includeLogs,
    decodeLogs: request.includeLogs,
    decodeTxData: true,
  });
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetTransactionsByHash: Action = {
  name: "GET_TRANSACTIONS_BY_HASH_ANKR",
  similes: [
    "FETCH_TRANSACTION_BY_HASH",
    "SHOW_TRANSACTION_BY_HASH",
    "VIEW_TRANSACTION_BY_HASH",
    "GET_TX_BY_HASH",
  ],
  description:
    "Retrieve transaction details by transaction hash on specified blockchain networks.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me transaction 0x5a4bf6970980a9381e6d6c78d96ab278035bbff58c383ffe96a0a2bbc7c02a4c on eth",
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
    methodName: "GetTransactionsByHash",
    requestValidator: validateGetTransactionsByHashRequest,
    requestSchema: getTransactionsByHashRequestSchema,
    methodHandler: getTransactionsByHashHandler,
    responseFormatter: formatGetTransactionsByHashReply,
  }),
};

export default actionGetTransactionsByHash;
