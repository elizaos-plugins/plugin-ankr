// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import {
  AnkrProvider,
  Blockchain,
  GetCurrenciesReply,
} from "@ankr.com/ankr.js";
import { Action, ActionExample, IAgentRuntime, Memory } from "@elizaos/core";
import { z } from "zod";
import { ValidationError } from "../error/base";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";

// ------------------------------------------------------------------------------------------------
// Types and Schemas
// ------------------------------------------------------------------------------------------------
export const getCurrenciesRequestSchema = z.object({
  blockchain: z
    .nativeEnum(Blockchains)
    .describe("The blockchain to get currencies for"),
});

type GetCurrenciesRequestType = z.infer<typeof getCurrenciesRequestSchema>;

// ------------------------------------------------------------------------------------------------
// Validation Functions
// ------------------------------------------------------------------------------------------------
const validateGetCurrenciesRequest = (
  content: unknown
): content is GetCurrenciesRequestType => {
  const result = getCurrenciesRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

// ------------------------------------------------------------------------------------------------
// Response Formatter
// ------------------------------------------------------------------------------------------------
const formatGetCurrenciesReply = (
  request: GetCurrenciesRequestType,
  response: GetCurrenciesReply
): string => {
  const { currencies, syncStatus } = response;

  // Format the response text
  let formattedText = `Here are the top currencies on ${request.blockchain}:\n\n`;

  if (currencies.length === 0) {
    formattedText += "No currencies found";
    return formattedText;
  }

  currencies.forEach((currency, index) => {
    formattedText += `${index + 1}. ${currency.name} (${currency.symbol})\n`;

    if (
      currency.address &&
      currency.address !== "0x0000000000000000000000000000000000000000"
    ) {
      formattedText += `   Contract: ${currency.address.slice(
        0,
        6
      )}...${currency.address.slice(-4)}\n`;
    } else {
      formattedText += `   Native Token\n`;
    }

    formattedText += `   Decimals: ${currency.decimals}\n\n`;
  });

  if (syncStatus) {
    formattedText += `Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})`;
  }

  return formattedText;
};

// ------------------------------------------------------------------------------------------------
// API Method Handler
// ------------------------------------------------------------------------------------------------
const getCurrenciesHandler = async (
  provider: AnkrProvider,
  request: GetCurrenciesRequestType
): Promise<GetCurrenciesReply> => {
  return provider.getCurrencies({
    blockchain: request.blockchain as Blockchain,
  });
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetCurrencies: Action = {
  name: "GET_CURRENCIES_ANKR",
  similes: [
    "LIST_CURRENCIES",
    "SHOW_CURRENCIES",
    "VIEW_CURRENCIES",
    "FETCH_CURRENCIES",
  ],
  description:
    "Retrieve information about currencies on specified blockchain networks.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me the top currencies on Ethereum",
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
    methodName: "GetCurrencies",
    requestValidator: validateGetCurrenciesRequest,
    requestSchema: getCurrenciesRequestSchema,
    methodHandler: getCurrenciesHandler,
    responseFormatter: formatGetCurrenciesReply,
  }),
};

export default actionGetCurrencies;
