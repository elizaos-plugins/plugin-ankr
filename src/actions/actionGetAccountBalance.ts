import { Blockchain, GetAccountBalanceReply } from "@ankr.com/ankr.js";
import { Action, IAgentRuntime, Memory } from "@elizaos/core";
import { z } from "zod";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";
import { ValidationError } from "../error/base";

/**
 * Schema for account balance requests
 */
export const getAccountBalanceRequestSchema = z.object({
  blockchain: z
    .union([z.nativeEnum(Blockchains), z.array(z.nativeEnum(Blockchains))])
    .optional()
    .describe("The blockchain(s) to check the balance on"),
  walletAddress: z
    .string()
    .startsWith("0x")
    .describe(
      "The EVM-like wallet address to check the balance of, e.g. 0x1234567890123456789012345678901234567890"
    ),
});

type GetAccountBalanceRequest = z.infer<typeof getAccountBalanceRequestSchema>;

/**
 * Validates the account balance request
 */
const validateGetAccountBalanceRequest = (
  content: unknown
): content is GetAccountBalanceRequest => {
  const result = getAccountBalanceRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

/**
 * Formats the account balance response into a human-readable string
 */
const formatGetAccountBalanceReply = (
  request: GetAccountBalanceRequest,
  response: GetAccountBalanceReply
): string => {
  // Format the response text
  let formattedText = `Here are the balances for wallet ${request.walletAddress}:\n\n`;
  if (response.assets.length === 0) {
    formattedText += "No balances found";
    return formattedText;
  }

  response.assets.forEach((balance, index: number) => {
    formattedText += `${index + 1}. ${balance.tokenName} (${
      balance.tokenType
    })\n`;
    formattedText += `   Balance: ${balance.balance} ${balance.tokenSymbol}\n`;
    if (balance.contractAddress) {
      formattedText += `   Contract: ${balance.contractAddress}\n`;
    }
    formattedText += `   USD Value: $${Number.parseFloat(
      balance.balanceUsd
    ).toFixed(2)}\n\n`;
  });

  return formattedText;
};

/**
 * Handles the API call to get account balance
 */
const getAccountBalanceHandler = (
  provider: any,
  request: GetAccountBalanceRequest
): Promise<GetAccountBalanceReply> => {
  return provider.getAccountBalance({
    blockchain: request.blockchain as Blockchain | Blockchain[],
    walletAddress: request.walletAddress,
    onlyWhitelisted: true,
    pageSize: 50,
  });
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetAccountBalance: Action = {
  name: "GET_ACCOUNT_BALANCE_ANKR",
  similes: [
    "CHECK_BALANCE",
    "SHOW_BALANCE",
    "VIEW_BALANCE",
    "GET_WALLET_BALANCE",
  ],
  description:
    "Retrieve account balance information across multiple blockchains.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me the balance for wallet 0x1234567890123456789012345678901234567890 on eth",
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
    methodName: "GetAccountBalance",
    requestValidator: validateGetAccountBalanceRequest,
    requestSchema: getAccountBalanceRequestSchema,
    methodHandler: getAccountBalanceHandler,
    responseFormatter: formatGetAccountBalanceReply,
  }),
};

export default actionGetAccountBalance;
