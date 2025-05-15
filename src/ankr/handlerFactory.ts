// ------------------------------------------------------------------------------------------------
// Essential Imports
// ------------------------------------------------------------------------------------------------
import {
  composeContext,
  elizaLogger,
  generateObject,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  ModelClass,
  State,
} from "@elizaos/core";
import { AnkrProvider } from "@ankr.com/ankr.js";
import { z } from "zod";
import { validateAnkrConfig } from "../environment";
import { APIError, ConfigurationError, ValidationError } from "../error/base";
import { blockchains, blockchainInfoMap } from "./blockchains";

// ------------------------------------------------------------------------------------------------
// Generic Handler Factory
// ------------------------------------------------------------------------------------------------
export type AnkrHandlerOptions<TRequest, TResponse> = {
  methodName: string;
  methodHandler: (
    provider: AnkrProvider,
    params: TRequest
  ) => Promise<TResponse>;
  requestSchema: z.ZodType<TRequest>;
  requestValidator: (content: unknown) => content is TRequest;
  responseFormatter: (request: TRequest, response: TResponse) => string;
};

// Create a standardized template generator function
const createStandardTemplate = (schema: z.ZodType<any>): string => {
  // Extract descriptions from schema to provide better guidance
  const schemaDescription = schema.description || "";

  // Get the shape of the schema to understand its properties
  const shape = (schema as any)._def?.shape || {};

  // Build property descriptions
  const propertyDescriptions = Object.entries(shape || {})
    .map(([key, value]: [string, any]) => {
      const desc = value?.description || "";
      return `- ${key}: ${desc}`;
    })
    .join("\n");

  // Get supported blockchains if the schema has a blockchain property
  const hasBlockchains = shape?.blockchain !== undefined;

  // Create a more informative blockchain section with both tags and full names
  const blockchainsSection = hasBlockchains
    ? `\n## Supported Blockchains\n\n### Mainnets\n${Object.values(
        blockchainInfoMap
      )
        .filter((info) => !info.isTestnet)
        .map((info) => `- ${info.fullName} (${info.tag})`)
        .join("\n")}\n\n### Testnets\n${Object.values(blockchainInfoMap)
        .filter((info) => info.isTestnet)
        .map((info) => `- ${info.fullName} (${info.tag})`)
        .join("\n")}`
    : "";

  return `Respond with a JSON markdown block containing only the extracted values
- Skip any values that cannot be determined.
- If no specific blockchain is mentioned, assume the user wants to check all supported blockchains.
- When a blockchain is mentioned by its full name (e.g., "Ethereum"), use the corresponding tag (e.g., "eth").

${schemaDescription ? `## Schema Description\n\n${schemaDescription}\n` : ""}
${propertyDescriptions ? `## Properties\n\n${propertyDescriptions}\n` : ""}
${blockchainsSection}

## Recent Messages

<recentMessages>
{{recentMessages}}
</recentMessages>

Given the recent messages, extract the following information according to the schema.

Respond with a JSON markdown block containing only the extracted values.`;
};

export function createAnkrHandler<TRequest, TResponse>({
  methodName,
  requestValidator: validator,
  methodHandler: apiMethod,
  responseFormatter: formatter,
  requestSchema: schema,
}: AnkrHandlerOptions<TRequest, TResponse>) {
  return async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options: { [key: string]: unknown } = {},
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.info(`[${methodName}] executing`);
    try {
      elizaLogger.debug(
        { content: message.content },
        `[${methodName}] message content`
      );

      const config = await validateAnkrConfig(runtime);
      const apikey = config.ANKR_API_KEY;
      if (!apikey) {
        throw new ConfigurationError(
          "ANKR_API_KEY not found in environment variables"
        );
      }
      const provider = new AnkrProvider(
        `https://rpc.ankr.com/multichain/${apikey}`
      );

      if (!state) {
        state = (await runtime.composeState(message)) as State;
      } else {
        state = await runtime.updateRecentMessageState(state);
      }

      // Generate the template based on the schema
      const template = createStandardTemplate(schema);

      const context = composeContext({
        state,
        template,
      });

      elizaLogger.debug(`[${methodName}] composed context`, {
        context,
      });

      const content = await generateObject({
        schema,
        context,
        modelClass: ModelClass.SMALL,
        runtime,
      });

      const request = content.object;
      elizaLogger.info(`[${methodName}] extracted request parameters`, {
        request,
      });

      if (!validator(request)) {
        throw new ValidationError("Invalid request");
      }

      elizaLogger.debug(`[${methodName}] API request parameters`, {
        params: request,
      });

      try {
        const response = await apiMethod(provider, request);

        elizaLogger.debug(`[${methodName}] received response from Ankr API`, {
          data: response,
        });

        const formattedResponse = formatter(request, response);
        callback?.({
          text: formattedResponse,
          content: {
            success: true,
            request,
            response,
          },
        });

        return true;
      } catch (error) {
        elizaLogger.error("API request failed", { error });
        throw new APIError(`Failed to fetch ${methodName} data`);
      }
    } catch (error) {
      elizaLogger.error("Handler execution failed", {
        error: error instanceof Error ? error.message : String(error),
      });

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      callback?.({
        text: `Error in ${methodName}: ${errorMessage}`,
        content: {
          error,
        },
      });

      if (
        error instanceof ConfigurationError ||
        error instanceof ValidationError ||
        error instanceof APIError
      ) {
        throw error;
      }

      throw new APIError(
        `Failed to execute ${methodName} action: ${error}`,
        error
      );
    }
  };
}
