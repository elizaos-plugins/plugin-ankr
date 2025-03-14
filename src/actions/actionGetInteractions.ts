// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import { Action, IAgentRuntime, Memory, ActionExample } from "@elizaos/core";
import {
  AnkrProvider,
  Blockchain,
  GetInteractionsReply,
  GetInteractionsRequest,
} from "@ankr.com/ankr.js";
import { z } from "zod";
import { ValidationError } from "../error/base";
import { Blockchains } from "../ankr/blockchains";
import { createAnkrHandler } from "../ankr/handlerFactory";

// ------------------------------------------------------------------------------------------------
// Types and Schemas
// ------------------------------------------------------------------------------------------------
export const getInteractionsRequestSchema = z.object({
  address: z
    .string()
    .startsWith("0x")
    .describe("The wallet address to get interactions for"),
  blockchain: z
    .nativeEnum(Blockchains)
    .optional()
    .describe("The blockchain to check interactions on (optional)"),
});

type GetInteractionsRequestType = z.infer<typeof getInteractionsRequestSchema>;

// ------------------------------------------------------------------------------------------------
// Validation Functions
// ------------------------------------------------------------------------------------------------
const validateGetInteractionsRequest = (
  content: unknown
): content is GetInteractionsRequestType => {
  const result = getInteractionsRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};

// ------------------------------------------------------------------------------------------------
// Response Formatter
// ------------------------------------------------------------------------------------------------
const formatGetInteractionsReply = (
  request: GetInteractionsRequestType,
  response: GetInteractionsReply
): string => {
  const { blockchains, syncStatus } = response;

  // Format the response text
  let formattedText = `Blockchain interactions for address ${request.address}:\n\n`;

  if (blockchains.length === 0) {
    formattedText += "No interactions found on any blockchain";
    return formattedText;
  }

  formattedText += `This address has interacted with the following blockchains:\n`;
  blockchains.forEach((chain, index) => {
    formattedText += `${index + 1}. ${chain}\n`;
  });

  if (syncStatus) {
    formattedText += `\nSync Status: ${syncStatus.status} (lag: ${syncStatus.lag})`;
  }

  return formattedText;
};

// ------------------------------------------------------------------------------------------------
// API Method Handler
// ------------------------------------------------------------------------------------------------
const getInteractionsHandler = async (
  provider: AnkrProvider,
  request: GetInteractionsRequestType
): Promise<GetInteractionsReply> => {
  return provider.getInteractions({
    address: request.address,
    // Only include blockchain if it's provided
    ...(request.blockchain && { blockchain: request.blockchain as Blockchain }),
  });
};

// ------------------------------------------------------------------------------------------------
// Core Action implementation
// ------------------------------------------------------------------------------------------------
export const actionGetInteractions: Action = {
  name: "GET_INTERACTIONS_ANKR",
  similes: [
    "FETCH_INTERACTIONS",
    "SHOW_INTERACTIONS",
    "VIEW_INTERACTIONS",
    "LIST_INTERACTIONS",
  ],
  description:
    "Retrieve interactions between wallets and smart contracts on specified blockchain networks.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me interactions for the wallet 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
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
    methodName: "GetInteractions",
    requestValidator: validateGetInteractionsRequest,
    requestSchema: getInteractionsRequestSchema,
    methodHandler: getInteractionsHandler,
    responseFormatter: formatGetInteractionsReply,
  }),
};

export default actionGetInteractions;
