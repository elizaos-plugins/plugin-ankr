// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import { Action, IAgentRuntime, Memory } from "@elizaos/core";
import {
  AnkrProvider,
  GetTokenPriceReply,
  Blockchain,
} from "@ankr.com/ankr.js";
import { z } from "zod";
import { ValidationError } from "../error/base";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";

/**
 * Schema for token price requests
 */
export const getTokenPriceRequestSchema = z.object({
  blockchain: z
    .nativeEnum(Blockchains)
    .describe("The blockchain to check the token price on"),
  contractAddress: z
    .string()
    .refine((val) => !val || val.startsWith("0x"), {
      message: "Contract address must either be empty or start with '0x'",
    })
    .optional()
    .describe(
      "The contract address of the token to check the price of. Leave empty for native token."
    ),
});

type GetTokenPriceRequest = z.infer<typeof getTokenPriceRequestSchema>;

/**
 * Validates the token price request
 */
const validateGetTokenPriceRequest = (
  content: unknown
): content is GetTokenPriceRequest => {
  const result = getTokenPriceRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

/**
 * Formats the token price response into a human-readable string
 */
const formatGetTokenPriceReply = (
  request: GetTokenPriceRequest,
  response: GetTokenPriceReply
): string => {
  const price = Number(response.usdPrice).toFixed(5);
  const contractDisplay = response.contractAddress
    ? `${response.contractAddress.slice(
        0,
        6
      )}...${response.contractAddress.slice(-4)}`
    : "Native Token";

  return (
    `Current token price on ${request.blockchain}:\n\n` +
    `Price: $${price} USD\n` +
    `Contract: ${contractDisplay}\n` +
    `Sync Status: ${response.syncStatus.status} (lag: ${response.syncStatus.lag})`
  );
};

/**
 * Handles the API call to get token price
 */
const getTokenPriceHandler = async (
  provider: AnkrProvider,
  request: GetTokenPriceRequest
): Promise<GetTokenPriceReply> => {
  return provider.getTokenPrice({
    blockchain: request.blockchain as Blockchain,
    contractAddress: request.contractAddress,
  });
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetTokenPrice: Action = {
  name: "GET_TOKEN_PRICE_ANKR",
  similes: ["CHECK_PRICE", "TOKEN_PRICE", "CRYPTO_PRICE", "PRICE_CHECK"],
  description:
    "Get the current USD price for any token on supported blockchains.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "What's the current price of ETH?",
        },
      },
    ],
    [
      {
        user: "user",
        content: {
          text: "What's the current price of 0x8290333cef9e6d528dd5618fb97a76f268f3edd4 token on eth?",
        },
      },
    ],
  ],
  validate: async (
    _runtime: IAgentRuntime,
    message: Memory
  ): Promise<boolean> => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetTokenPrice",
    requestValidator: validateGetTokenPriceRequest,
    requestSchema: getTokenPriceRequestSchema,
    methodHandler: getTokenPriceHandler,
    responseFormatter: formatGetTokenPriceReply,
  }),
};

export default actionGetTokenPrice;
