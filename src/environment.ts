import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

// ANKR API Configuration
export const ANKR_ENDPOINT = "https://rpc.ankr.com/multichain/";

export const ankrEnvSchema = z.object({
  ANKR_API_KEY: z.string().min(1, "ANKR_API_KEY is required"),
});

export type ankrConfig = z.infer<typeof ankrEnvSchema>;

export function getConfig(): ankrConfig {
  return {
    ANKR_API_KEY: process.env.ANKR_API_KEY || "",
  };
}

export async function validateAnkrConfig(
  runtime: IAgentRuntime
): Promise<ankrConfig> {
  try {
    const envConfig = getConfig();

    const config = {
      ANKR_API_KEY:
        process.env.ANKR_API_KEY ||
        runtime.getSetting("ANKR_API_KEY") ||
        envConfig.ANKR_API_KEY,
    };

    return ankrEnvSchema.parse(config);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to validate ANKR configuration: ${errorMessage}`);
  }
}
