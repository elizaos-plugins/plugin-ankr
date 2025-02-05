// src/index.ts
import chalk from "chalk";
import Table from "cli-table3";
import ora from "ora";

// src/environment.ts
import { z } from "zod";
var ENV = "production";
var ANKR_ENDPOINTS = {
  production: {
    multichain: "https://rpc.ankr.com/multichain/"
  }
};
var ankrEnvSchema = z.object({
  // API Configuration
  ANKR_ENV: z.enum(["production", "staging"]).default("production"),
  ANKR_WALLET: z.string().min(1, "ANKR_WALLET is required"),
  // Request Configuration
  ANKR_MAX_RETRIES: z.string().transform(Number).default("3"),
  ANKR_RETRY_DELAY: z.string().transform(Number).default("1000"),
  ANKR_TIMEOUT: z.string().transform(Number).default("5000"),
  // Logging Configuration
  ANKR_GRANULAR_LOG: z.boolean().default(true),
  ANKR_LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  // Runtime Configuration
  ANKR_RUNTIME_CHECK_MODE: z.boolean().default(false),
  ANKR_SPASH: z.boolean().default(false)
});
function getConfig(env = ENV || process.env.ANKR_ENV) {
  ENV = env || "production";
  return {
    ANKR_ENV: env || "production",
    ANKR_WALLET: process.env.ANKR_WALLET || "",
    ANKR_MAX_RETRIES: Number(process.env.ANKR_MAX_RETRIES || "3"),
    ANKR_RETRY_DELAY: Number(process.env.ANKR_RETRY_DELAY || "1000"),
    ANKR_TIMEOUT: Number(process.env.ANKR_TIMEOUT || "5000"),
    ANKR_GRANULAR_LOG: process.env.ANKR_GRANULAR_LOG === "true" || false,
    ANKR_LOG_LEVEL: process.env.ANKR_LOG_LEVEL || "info",
    ANKR_RUNTIME_CHECK_MODE: process.env.RUNTIME_CHECK_MODE === "true" || false,
    ANKR_SPASH: process.env.ANKR_SPASH === "true" || false
  };
}
async function validateankrConfig(runtime) {
  try {
    const envConfig = getConfig(
      runtime.getSetting("ankr_ENV") ?? void 0
    );
    const config14 = {
      ANKR_ENV: process.env.ANKR_ENV || runtime.getSetting("ANKR_ENV") || envConfig.ANKR_ENV,
      ANKR_WALLET: process.env.ANKR_WALLET || runtime.getSetting("ANKR_WALLET") || envConfig.ANKR_WALLET,
      ANKR_MAX_RETRIES: process.env.ANKR_MAX_RETRIES || runtime.getSetting("ANKR_MAX_RETRIES") || envConfig.ANKR_MAX_RETRIES.toString(),
      ANKR_RETRY_DELAY: process.env.ANKR_RETRY_DELAY || runtime.getSetting("ANKR_RETRY_DELAY") || envConfig.ANKR_RETRY_DELAY.toString(),
      ANKR_TIMEOUT: process.env.ANKR_TIMEOUT || runtime.getSetting("ANKR_TIMEOUT") || envConfig.ANKR_TIMEOUT.toString(),
      ANKR_GRANULAR_LOG: process.env.ANKR_GRANULAR_LOG === "true" || false,
      ANKR_LOG_LEVEL: process.env.ANKR_LOG_LEVEL || runtime.getSetting("ANKR_LOG_LEVEL") || envConfig.ANKR_LOG_LEVEL,
      ANKR_RUNTIME_CHECK_MODE: process.env.RUNTIME_CHECK_MODE === "true" || false,
      ANKR_SPASH: process.env.ANKR_SPASH === "true" || false
    };
    return ankrEnvSchema.parse(config14);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to validate ANKR configuration: ${errorMessage}`);
  }
}

// src/actions/actionGetTokenHoldersCount.ts
import { elizaLogger as elizaLogger2 } from "@elizaos/core";
import axios from "axios";

// src/error/base.ts
var HyperbolicError = class _HyperbolicError extends Error {
  constructor(message) {
    super(message);
    this.name = "HyperbolicError";
    Object.setPrototypeOf(this, _HyperbolicError.prototype);
  }
};
var ConfigurationError = class _ConfigurationError extends HyperbolicError {
  constructor(message) {
    super(message);
    this.name = "ConfigurationError";
    Object.setPrototypeOf(this, _ConfigurationError.prototype);
  }
};
var APIError = class _APIError extends HyperbolicError {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "APIError";
    Object.setPrototypeOf(this, _APIError.prototype);
  }
};
var ValidationError = class _ValidationError extends HyperbolicError {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, _ValidationError.prototype);
  }
};

// src/validator/apiParseValidation.ts
import { elizaLogger } from "@elizaos/core";
var ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
var TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
var normalizeChainName = (chain) => {
  chain = chain.toLowerCase().trim();
  switch (chain) {
    case "eth":
    case "ethereum":
      return "eth";
    case "bsc":
    case "bnb":
      return "bsc";
    case "polygon":
    case "matic":
      return "polygon";
    case "avalanche":
    case "avax":
      return "avalanche";
    case "optimism":
    case "op":
      return "optimism";
    case "base":
      return "base";
    default:
      throw new ValidationError(`Unsupported blockchain: ${chain}`);
  }
};
var validateAddress = (address) => {
  return ADDRESS_REGEX.test(address);
};
var validateTxHash = (hash) => {
  return TX_HASH_REGEX.test(hash);
};
var validateBlockNumber = (block) => {
  return /^\d+$/.test(block);
};
var validateTimestamp = (timestamp) => {
  const num = parseInt(timestamp, 10);
  return !isNaN(num) && num > 0;
};
var validateTokenId = (tokenId) => {
  return tokenId.trim() !== "";
};
function parseAPIContent(text) {
  try {
    const parsed = {
      raw: {
        text,
        matches: {
          wallet: false,
          chain: false,
          contract: false,
          token: false,
          txHash: false,
          block: false,
          block2: false,
          fromTimestamp: false,
          toTimestamp: false
        }
      }
    };
    const walletMatch = text.match(/\[wallet\]([\s\S]*?)\[\/wallet\]/);
    if (walletMatch) {
      const wallet = walletMatch[1].trim();
      if (!validateAddress(wallet)) {
        throw new ValidationError(`Invalid wallet address: ${wallet}`);
      }
      parsed.wallet = wallet;
      parsed.raw.matches.wallet = true;
    }
    const chainMatch = text.match(/\[chain\]([\s\S]*?)\[\/chain\]/);
    if (chainMatch) {
      const chain = chainMatch[1].trim();
      parsed.chain = normalizeChainName(chain);
      parsed.raw.matches.chain = true;
    }
    const contractMatch = text.match(/\[contract\]([\s\S]*?)\[\/contract\]/);
    if (contractMatch) {
      const contract = contractMatch[1].trim();
      if (!validateAddress(contract)) {
        throw new ValidationError(`Invalid contract address: ${contract}`);
      }
      parsed.contract = contract;
      parsed.raw.matches.contract = true;
    }
    const tokenMatch = text.match(/\[token\]([\s\S]*?)\[\/token\]/);
    if (tokenMatch) {
      const token = tokenMatch[1].trim();
      if (!validateTokenId(token)) {
        throw new ValidationError(`Invalid token ID: ${token}`);
      }
      parsed.token = token;
      parsed.raw.matches.token = true;
    }
    const txMatch = text.match(/\[txHash\]([\s\S]*?)\[\/txHash\]/);
    if (txMatch) {
      const txHash = txMatch[1].trim();
      if (!validateTxHash(txHash)) {
        throw new ValidationError(`Invalid transaction hash: ${txHash}`);
      }
      parsed.txHash = txHash;
      parsed.raw.matches.txHash = true;
    }
    const blockMatch = text.match(/\[block\]([\s\S]*?)\[\/block\]/);
    if (blockMatch) {
      const block = blockMatch[1].trim();
      if (!validateBlockNumber(block)) {
        throw new ValidationError(`Invalid block number: ${block}`);
      }
      parsed.block = block;
      parsed.raw.matches.block = true;
    }
    const block2Match = text.match(/\[block2\]([\s\S]*?)\[\/block2\]/);
    if (block2Match) {
      const block2 = block2Match[1].trim();
      if (!validateBlockNumber(block2)) {
        throw new ValidationError(`Invalid block number: ${block2}`);
      }
      parsed.block2 = block2;
      parsed.raw.matches.block2 = true;
    }
    const fromTimestampMatch = text.match(/\[fromtimestamp\]([\s\S]*?)\[\/fromtimestamp\]/);
    if (fromTimestampMatch) {
      const timestamp = fromTimestampMatch[1].trim();
      if (!validateTimestamp(timestamp)) {
        throw new ValidationError(`Invalid from timestamp: ${timestamp}`);
      }
      parsed.fromTimestamp = parseInt(timestamp, 10);
      parsed.raw.matches.fromTimestamp = true;
    }
    const toTimestampMatch = text.match(/\[totimestamp\]([\s\S]*?)\[\/totimestamp\]/);
    if (toTimestampMatch) {
      const timestamp = toTimestampMatch[1].trim();
      if (!validateTimestamp(timestamp)) {
        throw new ValidationError(`Invalid to timestamp: ${timestamp}`);
      }
      parsed.toTimestamp = parseInt(timestamp, 10);
      parsed.raw.matches.toTimestamp = true;
    }
    return parsed;
  } catch (error) {
    elizaLogger.error("API content parsing failed", {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}
function validateRequiredFields(parsed, required) {
  const missing = required.filter((field) => !parsed.raw.matches[field]);
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(", ")}. Please provide them in the format [field]value[/field]`
    );
  }
}

// src/actions/actionGetTokenHoldersCount.ts
var config = getConfig();
var GRANULAR_LOG = config.ANKR_GRANULAR_LOG;
var logGranular = (message, data) => {
  if (GRANULAR_LOG) {
    elizaLogger2.debug(`[GetTokenHoldersCount] ${message}`, data);
    console.log(`[GetTokenHoldersCount] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetTokenHoldersCount = {
  name: "GET_TOKEN_HOLDERS_COUNT_ANKR",
  similes: ["COUNT_HOLDERS", "TOTAL_HOLDERS", "HOLDERS_COUNT", "NUMBER_OF_HOLDERS"],
  description: "Get the total number of holders and historical data for a specific token.",
  // Fix the example data to match the interface
  examples: [[
    {
      user: "user",
      content: {
        text: "How many holders does [contract]0xdAC17F958D2ee523a2206206994597C13D831ec7[/contract] have? [chain]eth[/chain]",
        filters: {
          blockchain: "eth",
          contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "Token Holders Count on ETH:\n\nCurrent Holders: 500,000\n\nHistorical Data:\n1. 1/24/2024\n   Holders: 500,000\n   Total Amount: 1,000,000\n\nSync Status: completed (0s)",
        success: true,
        data: {
          blockchain: "eth",
          contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          tokenDecimals: 18,
          holderCountHistory: [
            {
              holderCount: 5e5,
              totalAmount: "1000000",
              totalAmountRawInteger: "1000000000000000000000000",
              lastUpdatedAt: "2024-01-24T10:30:15Z"
            }
          ],
          latestHoldersCount: 5e5,
          syncStatus: {
            timestamp: 1706093415,
            lag: "0s",
            status: "completed"
          }
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_TOKEN_HOLDERS_COUNT_ANKR") {
      return true;
    }
    logGranular("Validating GET_TOKEN_HOLDERS_COUNT_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      const parsedContent = parseAPIContent(content.text);
      if (!parsedContent.chain || !parsedContent.contract) {
        throw new ValidationError("Blockchain and contract address are required");
      }
      logGranular("Validation successful");
      return true;
    } catch (error) {
      logGranular("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular("Executing GET_TOKEN_HOLDERS_COUNT_ANKR action");
    try {
      const messageContent = message.content;
      console.log("Debug - Full message content:", {
        fullContent: message.content,
        rawText: messageContent?.text,
        type: message.content?.type,
        allKeys: Object.keys(message.content || {})
      });
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      console.log("Debug - Raw prompt:", {
        text: messageContent.text,
        promptLength: messageContent.text?.length
      });
      const parsedContent = parseAPIContent(messageContent.text);
      console.log("Debug - Parsed API content:", {
        hasContract: !!parsedContent.contract,
        hasChain: !!parsedContent.chain,
        contract: parsedContent.contract,
        chain: parsedContent.chain,
        matches: parsedContent.raw.matches
      });
      validateRequiredFields(parsedContent, ["contract", "chain"]);
      const requestParams = {
        blockchain: parsedContent.chain,
        contractAddress: parsedContent.contract,
        pageSize: 10
      };
      try {
        const response = await axios.post(
          endpoint,
          {
            jsonrpc: "2.0",
            method: "ankr_getTokenHoldersCount",
            params: requestParams,
            id: 1
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        logGranular("Received response from Ankr API", {
          statusCode: response.status,
          data: response.data
        });
        if (response.data.error) {
          throw new APIError(`Ankr API error: ${response.data.error.message}`);
        }
        const result = response.data.result;
        let formattedText = `Token Holders Count on ${parsedContent.chain?.toUpperCase() || "UNKNOWN"}:

`;
        formattedText += `Current Holders: ${result.latestHoldersCount.toLocaleString()}

`;
        formattedText += "Historical Data:\n";
        result.holderCountHistory.forEach((history, index) => {
          const date = new Date(history.lastUpdatedAt).toLocaleDateString();
          formattedText += `
${index + 1}. ${date}
   Holders: ${history.holderCount.toLocaleString()}
   Total Amount: ${Number(history.totalAmount).toLocaleString()}`;
        });
        if (result.syncStatus) {
          formattedText += `

Sync Status: ${result.syncStatus.status} (${result.syncStatus.lag})`;
        }
        if (callback) {
          logGranular("Sending success callback with formatted text", { formattedText });
          callback({
            text: formattedText,
            success: true,
            data: result
          });
        }
        return true;
      } catch (error) {
        logGranular("API request failed", { error });
        if (axios.isAxiosError(error)) {
          throw new APIError(
            `Failed to fetch token holders count: ${error.message}`,
            error.response?.status
          );
        }
        throw new APIError("Failed to fetch token holders count");
      }
    } catch (error) {
      logGranular("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting token holders count: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_TOKEN_HOLDERS_COUNT_ANKR action");
    }
  }
};

// src/actions/actionGetTokenPrice.ts
import { elizaLogger as elizaLogger3 } from "@elizaos/core";
import axios2 from "axios";
var config2 = getConfig();
var GRANULAR_LOG2 = config2.ANKR_GRANULAR_LOG;
var logGranular2 = (message, data) => {
  if (GRANULAR_LOG2) {
    elizaLogger3.debug(`[GetTokenPrice] ${message}`, data);
    console.log(`[GetTokenPrice] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetTokenPrice = {
  name: "GET_TOKEN_PRICE_ANKR",
  similes: ["CHECK_PRICE", "TOKEN_PRICE", "CRYPTO_PRICE", "PRICE_CHECK"],
  description: "Get the current USD price for any token on eth blockchain.",
  examples: [[
    {
      user: "user",
      content: {
        text: "What's the current price of [contract]0x8290333cef9e6d528dd5618fb97a76f268f3edd4[/contract] token [chain]eth[/chain]",
        filters: {
          blockchain: "eth",
          contractAddress: "0x8290333cef9e6d528dd5618fb97a76f268f3edd4"
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "Current token price on eth:\n\nPrice: $0.03024 USD\nContract: 0x8290...3edd4\nSync Status: synced (lag: -8s)",
        success: true,
        data: {
          blockchain: "eth",
          contractAddress: "0x8290333cef9e6d528dd5618fb97a76f268f3edd4",
          usdPrice: "0.030239944206509556547",
          syncStatus: {
            timestamp: 1737760907,
            lag: "-8s",
            status: "synced"
          }
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_TOKEN_PRICE_ANKR") {
      return true;
    }
    logGranular2("Validating GET_TOKEN_PRICE_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      const parsedContent = parseAPIContent(content.text);
      if (!parsedContent.chain || !parsedContent.contract) {
        throw new ValidationError("Blockchain and contract address are required");
      }
      logGranular2("Validation successful");
      return true;
    } catch (error) {
      logGranular2("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular2("Executing GET_TOKEN_PRICE_ANKR action");
    try {
      const messageContent = message.content;
      console.log("Debug - Full message content:", {
        fullContent: message.content,
        rawText: messageContent?.text,
        type: message.content?.type,
        allKeys: Object.keys(message.content || {})
      });
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      console.log("Debug - Raw prompt:", {
        text: messageContent.text,
        promptLength: messageContent.text?.length
      });
      const parsedContent = parseAPIContent(messageContent.text);
      validateRequiredFields(parsedContent, ["contract", "chain"]);
      try {
        const response = await axios2.post(
          endpoint,
          {
            jsonrpc: "2.0",
            method: "ankr_getTokenPrice",
            params: {
              blockchain: parsedContent.chain,
              contractAddress: parsedContent.contract
            },
            id: 1
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        logGranular2("Received response from Ankr API", {
          statusCode: response.status,
          data: response.data
        });
        if (response.data.error) {
          throw new APIError(`Ankr API error: ${response.data.error.message}`);
        }
        const result = response.data.result;
        const price = Number(result.usdPrice).toFixed(5);
        const formattedText = `Current token price on ${parsedContent.chain}:

Price: $${price} USD
Contract: ${result.contractAddress.slice(0, 6)}...${result.contractAddress.slice(-4)}
Sync Status: ${result.syncStatus.status} (lag: ${result.syncStatus.lag})`;
        if (callback) {
          callback({
            text: formattedText,
            success: true,
            data: result
          });
        }
        return true;
      } catch (error) {
        logGranular2("API request failed", { error });
        if (axios2.isAxiosError(error)) {
          throw new APIError(
            `Failed to fetch token price: ${error.message}`,
            error.response?.status
          );
        }
        throw new APIError("Failed to fetch token price");
      }
    } catch (error) {
      logGranular2("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting token price: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_TOKEN_PRICE_ANKR action");
    }
  }
};

// src/actions/actionGetTokenTransfers.ts
import { elizaLogger as elizaLogger4 } from "@elizaos/core";
import axios3 from "axios";
var config3 = getConfig();
var GRANULAR_LOG3 = config3.ANKR_GRANULAR_LOG;
var logGranular3 = (message, data) => {
  if (GRANULAR_LOG3) {
    elizaLogger4.debug(`[GetTokenTransfers] ${message}`, data);
    console.log(`[GetTokenTransfers] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetTokenTransfers = {
  name: "GET_TOKEN_TRANSFERS_ANKR",
  similes: ["LIST_TRANSFERS", "SHOW_TRANSFERS", "TOKEN_MOVEMENTS", "TRANSFER_HISTORY"],
  description: "Get transfer history for a specific token or address on eth.",
  examples: [[
    {
      user: "user",
      content: {
        text: "Show me recent contract [contract]0xff970a61a04b1ca14834a43f5de4533ebddb5cc8[/contract] transfers [chain]eth[/chain] from [fromtimestamp]1655197483[/fromtimestamp] to [totimestamp]1656061483[/totimestamp]",
        filters: {
          blockchain: "eth",
          contractAddress: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
          pageSize: 5,
          fromTimestamp: 1655197483,
          toTimestamp: 1656061483
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "Here are the 5 most recent USDC transfers on eth:\n\n1. Transfer\n   From: 0x1234...5678\n   To: 0xabcd...ef01\n   Amount: 10,000 USDC\n   Time: 2024-01-24 10:30:15\n\n2. Transfer\n   From: 0x9876...5432\n   To: 0xfedc...ba98\n   Amount: 5,000 USDC\n   Time: 2024-01-24 10:29:45",
        success: true,
        data: {
          transfers: [{
            fromAddress: "0x1234567890123456789012345678901234567890",
            toAddress: "0xabcdef0123456789abcdef0123456789abcdef01",
            contractAddress: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
            value: "10000.0",
            valueRawInteger: "10000000000000000000000",
            blockchain: "eth",
            tokenName: "USD Coin",
            tokenSymbol: "USDC",
            tokenDecimals: 6,
            thumbnail: "",
            transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            blockHeight: 123456789,
            timestamp: 1706093415
          }],
          syncStatus: {
            timestamp: 1706093415,
            lag: "0s",
            status: "completed"
          }
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_TOKEN_TRANSFERS_ANKR") {
      return true;
    }
    logGranular3("Validating GET_TOKEN_TRANSFERS_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      const parsedContent = parseAPIContent(content.text);
      if (!parsedContent.chain || !parsedContent.contract) {
        throw new ValidationError("Blockchain and contract address are required");
      }
      if (parsedContent.fromTimestamp && parsedContent.toTimestamp) {
        if (parsedContent.fromTimestamp > parsedContent.toTimestamp) {
          throw new ValidationError("From timestamp must be less than to timestamp");
        }
      }
      logGranular3("Validation successful");
      return true;
    } catch (error) {
      logGranular3("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular3("Executing GET_TOKEN_TRANSFERS_ANKR action");
    try {
      const messageContent = message.content;
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      console.log("Debug - Raw prompt:", {
        text: messageContent.text,
        promptLength: messageContent.text?.length
      });
      const parsedContent = parseAPIContent(messageContent.text);
      console.log("Debug - Parsed API content:", {
        hasContract: !!parsedContent.contract,
        hasChain: !!parsedContent.chain,
        hasFromTimestamp: !!parsedContent.fromTimestamp,
        hasToTimestamp: !!parsedContent.toTimestamp,
        contract: parsedContent.contract,
        chain: parsedContent.chain,
        fromTimestamp: parsedContent.fromTimestamp,
        toTimestamp: parsedContent.toTimestamp
      });
      validateRequiredFields(parsedContent, ["contract", "chain", "fromTimestamp", "toTimestamp"]);
      try {
        const response = await axios3.post(
          endpoint,
          {
            jsonrpc: "2.0",
            method: "ankr_getTokenTransfers",
            params: {
              address: parsedContent.contract,
              blockchain: [parsedContent.chain],
              fromTimestamp: parsedContent.fromTimestamp,
              toTimestamp: parsedContent.toTimestamp,
              pageSize: messageContent.filters?.pageSize || 10
            },
            id: 1
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        logGranular3("Received response from Ankr API", {
          statusCode: response.status,
          data: response.data
        });
        if (response.data.error) {
          throw new APIError(`Ankr API error: ${response.data.error.message}`);
        }
        const result = response.data.result;
        let formattedText = `Token Transfers on ${parsedContent.chain?.toUpperCase() || "UNKNOWN"}:

`;
        result.transfers.forEach((transfer, index) => {
          const date = new Date(transfer.timestamp * 1e3).toLocaleString();
          const value = Number(transfer.value).toLocaleString();
          formattedText += `${index + 1}. Transfer
`;
          formattedText += `   From: ${transfer.fromAddress.slice(0, 6)}...${transfer.fromAddress.slice(-4)}
`;
          formattedText += `   To: ${transfer.toAddress.slice(0, 6)}...${transfer.toAddress.slice(-4)}
`;
          formattedText += `   Amount: ${value} ${transfer.tokenSymbol}
`;
          formattedText += `   Token: ${transfer.tokenName}
`;
          formattedText += `   Time: ${date}

`;
        });
        if (result.syncStatus) {
          formattedText += `
Sync Status: ${result.syncStatus.status} (lag: ${result.syncStatus.lag})
`;
        }
        if (callback) {
          logGranular3("Sending success callback with formatted text", { formattedText });
          callback({
            text: formattedText,
            success: true,
            data: {
              transfers: result.transfers,
              nextPageToken: result.nextPageToken
            }
          });
        }
        return true;
      } catch (error) {
        logGranular3("API request failed", { error });
        if (axios3.isAxiosError(error)) {
          throw new APIError(
            `Failed to fetch token transfers: ${error.message}`,
            error.response?.status
          );
        }
        throw new APIError("Failed to fetch token transfers");
      }
    } catch (error) {
      logGranular3("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting token transfers: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_TOKEN_TRANSFERS_ANKR action");
    }
  }
};

// src/actions/actionGetAccountBalance.ts
import { elizaLogger as elizaLogger5 } from "@elizaos/core";
import axios4 from "axios";
var config4 = getConfig();
var GRANULAR_LOG4 = config4.ANKR_GRANULAR_LOG;
var logGranular4 = (message, data) => {
  if (GRANULAR_LOG4) {
    elizaLogger5.debug(`[GetAccountBalance] ${message}`, data);
    console.log(`[GetAccountBalance] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetAccountBalance = {
  name: "GET_ACCOUNT_BALANCE_ANKR",
  similes: ["CHECK_BALANCE", "SHOW_BALANCE", "VIEW_BALANCE", "GET_WALLET_BALANCE"],
  description: "Retrieve account balance information across multiple blockchains.",
  examples: [[
    {
      user: "user",
      content: {
        text: "Show me the balance for wallet [wallet]0x1234567890123456789012345678901234567890[/wallet] on [chain]eth[/chain]",
        filters: {
          blockchain: ["eth"],
          walletAddress: "0x1234567890123456789012345678901234567890"
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "Here are the balances for wallet 0x1234...7890:\n\n1. ETH (Native)\n   Balance: 1.5 ETH\n   USD Value: $3,000.00\n\n2. USDC (ERC20)\n   Balance: 1000 USDC\n   Contract: 0xa0b8...c4d5\n   USD Value: $1,000.00",
        success: true,
        data: {
          address: "0x1234567890123456789012345678901234567890",
          balances: [{
            blockchain: "eth",
            tokenName: "Ethereum",
            symbol: "ETH",
            balance: "1.5",
            balanceRawInteger: "1500000000000000000",
            balanceUsd: "3000.00",
            tokenDecimals: 18,
            tokenType: "NATIVE"
          }, {
            blockchain: "eth",
            tokenName: "USD Coin",
            symbol: "USDC",
            balance: "1000",
            balanceRawInteger: "1000000000",
            balanceUsd: "1000.00",
            tokenDecimals: 6,
            tokenType: "ERC20",
            contractAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
          }]
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_ACCOUNT_BALANCE_ANKR") {
      return true;
    }
    logGranular4("Validating GET_ACCOUNT_BALANCE_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      if (!content.filters?.walletAddress) {
        throw new ValidationError("Wallet address is required");
      }
      if (content.filters?.blockchain && !Array.isArray(content.filters.blockchain)) {
        throw new ValidationError("Blockchain must be an array");
      }
      logGranular4("Validation successful");
      return true;
    } catch (error) {
      logGranular4("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular4("Executing GET_ACCOUNT_BALANCE_ANKR action");
    try {
      const messageContent = message.content;
      console.log("Debug - Full message content:", {
        fullContent: message.content,
        rawText: messageContent?.text,
        type: message.content?.type,
        allKeys: Object.keys(message.content || {})
      });
      console.log("Debug - Message content details:", {
        hasText: !!messageContent?.text,
        hasFilters: !!messageContent?.filters,
        textContent: messageContent?.text,
        contentType: typeof messageContent?.text
      });
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      console.log("Debug - Raw prompt:", {
        text: messageContent.text,
        promptLength: messageContent.text?.length
      });
      const parsedContent = parseAPIContent(messageContent.text);
      console.log("Debug - Parsed API content:", {
        hasWallet: !!parsedContent.wallet,
        hasChain: !!parsedContent.chain,
        wallet: parsedContent.wallet,
        chain: parsedContent.chain,
        matches: parsedContent.raw.matches
      });
      validateRequiredFields(parsedContent, ["wallet", "chain"]);
      const requestParams = {
        blockchain: [parsedContent.chain],
        walletAddress: parsedContent.wallet
      };
      console.log("Debug - API request parameters:", {
        params: requestParams,
        endpoint: ANKR_ENDPOINTS.production.multichain
      });
      try {
        const response = await axios4.post(
          endpoint,
          {
            jsonrpc: "2.0",
            method: "ankr_getAccountBalance",
            params: requestParams,
            id: 1
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        logGranular4("Received response from Ankr API", {
          statusCode: response.status,
          data: response.data
        });
        if (response.data.error) {
          throw new APIError(`Ankr API error: ${response.data.error.message}`);
        }
        const balances = response.data.result.assets;
        const address = parsedContent.wallet;
        let formattedText = `Here are the balances for wallet ${address?.slice(0, 6)}...${address?.slice(-4)}:

`;
        balances.forEach((balance, index) => {
          formattedText += `${index + 1}. ${balance.tokenName} (${balance.tokenType})
`;
          formattedText += `   Balance: ${balance.balance} ${balance.tokenSymbol}
`;
          if (balance.contractAddress) {
            formattedText += `   Contract: ${balance.contractAddress.slice(0, 6)}...${balance.contractAddress.slice(-4)}
`;
          }
          formattedText += `   USD Value: $${Number.parseFloat(balance.balanceUsd).toFixed(2)}

`;
        });
        if (callback) {
          logGranular4("Sending success callback with formatted text", { formattedText });
          callback({
            text: formattedText,
            success: true,
            data: {
              address,
              balances
            }
          });
        }
        return true;
      } catch (error) {
        logGranular4("API request failed", { error });
        if (axios4.isAxiosError(error)) {
          throw new APIError(
            `Failed to fetch balance data: ${error.message}`,
            error.response?.status
          );
        }
        throw new APIError("Failed to fetch balance data");
      }
    } catch (error) {
      logGranular4("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting account balance: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_ACCOUNT_BALANCE_ANKR action");
    }
  }
};

// src/actions/actionGetTransactionsByAddress.ts
import { elizaLogger as elizaLogger6 } from "@elizaos/core";
import axios5 from "axios";
var config5 = getConfig();
var GRANULAR_LOG5 = config5.ANKR_GRANULAR_LOG;
var logGranular5 = (message, data) => {
  if (GRANULAR_LOG5) {
    elizaLogger6.debug(`[GetTransactionsByAddress] ${message}`, data);
    console.log(`[GetTransactionsByAddress] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetTransactionsByAddress = {
  name: "GET_TRANSACTIONS_BY_ADDRESS_ANKR",
  similes: ["LIST_TXS", "SHOW_TXS", "VIEW_TRANSACTIONS", "GET_ADDRESS_TXS"],
  description: "Get transactions for a specific address on the blockchain",
  examples: [[
    {
      user: "user",
      content: {
        text: "Show me the latest transactions for address [contract]0xd8da6bf26964af9d7eed9e03e53415d37aa96045[/contract] [chain]eth[/chain]",
        filters: {
          blockchain: "eth",
          address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
          pageSize: 2,
          includeLogs: true
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "Here are the latest transactions for the address on eth:\n\n1. Transfer Out\n   To: 0x1234...5678\n   Amount: 1.5 ETH\n   Time: 2024-01-24 10:30:15\n   Status: Success\n\n2. Contract Interaction\n   Contract: 0xabcd...ef01 (Uniswap V3)\n   Method: swapExactTokensForTokens\n   Time: 2024-01-24 10:15:22\n   Status: Success",
        success: true,
        data: {
          transactions: [{
            blockchain: "eth",
            from: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
            to: "0x1234567890123456789012345678901234567890",
            hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            value: "1500000000000000000",
            gas: "21000",
            gasPrice: "100000000",
            gasUsed: "21000",
            timestamp: "2024-01-24T10:30:15Z",
            status: "1",
            blockNumber: "123456789",
            blockHash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba"
          }]
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_TRANSACTIONS_BY_ADDRESS_ANKR") {
      return true;
    }
    logGranular5("Validating GET_TRANSACTIONS_BY_ADDRESS_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      const parsedContent = parseAPIContent(content.text);
      if (!parsedContent.chain || !parsedContent.contract) {
        throw new ValidationError("Blockchain and address are required");
      }
      if (content.filters?.pageSize && (content.filters.pageSize < 1 || content.filters.pageSize > 100)) {
        throw new ValidationError("Page size must be between 1 and 100");
      }
      logGranular5("Validation successful");
      return true;
    } catch (error) {
      logGranular5("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular5("Executing GET_TRANSACTIONS_BY_ADDRESS_ANKR action");
    try {
      const messageContent = message.content;
      console.log("Debug - Full message content:", {
        fullContent: message.content,
        rawText: messageContent?.text,
        type: message.content?.type,
        allKeys: Object.keys(message.content || {})
      });
      console.log("Debug - Message content details:", {
        hasText: !!messageContent?.text,
        hasFilters: !!messageContent?.filters,
        textContent: messageContent?.text,
        contentType: typeof messageContent?.text
      });
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      console.log("Debug - Raw prompt:", {
        text: messageContent.text,
        promptLength: messageContent.text?.length
      });
      const parsedContent = parseAPIContent(messageContent.text);
      console.log("Debug - Parsed API content:", {
        hasContract: !!parsedContent.contract,
        hasChain: !!parsedContent.chain,
        contract: parsedContent.contract,
        chain: parsedContent.chain
      });
      validateRequiredFields(parsedContent, ["contract", "chain"]);
      try {
        const response = await axios5.post(
          endpoint,
          {
            jsonrpc: "2.0",
            method: "ankr_getTransactionsByAddress",
            params: {
              blockchain: [parsedContent.chain],
              address: parsedContent.contract,
              pageSize: messageContent.filters?.pageSize || 5,
              includeLogs: messageContent.filters?.includeLogs || true
            },
            id: 1
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        if (response.data.error) {
          throw new APIError(`Ankr API error: ${response.data.error.message}`);
        }
        const result = response.data.result;
        let formattedText = `Transactions for ${parsedContent.contract} on ${parsedContent.chain?.toUpperCase() || "UNKNOWN"}:

`;
        result.transactions.forEach((tx, index) => {
          const date = new Date(Number.parseInt(tx.timestamp, 16) * 1e3).toLocaleString();
          const value = Number.parseInt(tx.value, 16) / 1e18;
          const status = tx.status === "0x1" ? "Success" : "Failed";
          formattedText += `${index + 1}. Transaction
`;
          formattedText += `   Hash: ${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}
`;
          formattedText += `   From: ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}
`;
          formattedText += `   To: ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}
`;
          formattedText += `   Value: ${value.toFixed(4)} ETH
`;
          formattedText += `   Status: ${status}
`;
          formattedText += `   Time: ${date}

`;
        });
        if (callback) {
          callback({
            text: formattedText,
            success: true,
            data: {
              transactions: result.transactions,
              nextPageToken: result.nextPageToken,
              syncStatus: result.syncStatus
            }
          });
        }
        return true;
      } catch (error) {
        logGranular5("API request failed", { error });
        if (axios5.isAxiosError(error)) {
          throw new APIError(
            `Failed to fetch transactions: ${error.message}`,
            error.response?.status
          );
        }
        throw new APIError("Failed to fetch transactions");
      }
    } catch (error) {
      logGranular5("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting transactions: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_TRANSACTIONS_BY_ADDRESS_ANKR action");
    }
  }
};

// src/actions/actionGetTransactionsByHash.ts
import { elizaLogger as elizaLogger7 } from "@elizaos/core";
import axios6 from "axios";
var config6 = getConfig();
var GRANULAR_LOG6 = config6.ANKR_GRANULAR_LOG;
var logGranular6 = (message, data) => {
  if (GRANULAR_LOG6) {
    elizaLogger7.debug(`[GetTransactionsByHash] ${message}`, data);
    console.log(`[GetTransactionsByHash] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetTransactionsByHash = {
  name: "GET_TRANSACTIONS_BY_HASH_ANKR",
  similes: ["GET_TX", "SHOW_TRANSACTION", "VIEW_TX", "TRANSACTION_DETAILS"],
  description: "Get detailed information about a transaction by its hash",
  examples: [[
    {
      user: "user",
      content: {
        text: "Show me details for transaction [txHash]0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef[/txHash] [chain]eth[/chain]",
        filters: {
          blockchain: "eth",
          transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          includeLogs: true
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "Here are the details for the transaction on eth:\n\nTransaction: 0x1234...cdef\nStatus: Success\nFrom: 0xabcd...ef01\nTo: 0x9876...5432\nValue: 1.5 ETH\nGas Used: 150,000\nGas Price: 0.1 Gwei\nBlock: 123456789\nTimestamp: 2024-01-24 10:30:15",
        success: true,
        data: {
          transactions: [{
            blockchain: "eth",
            from: "0xabcdef0123456789abcdef0123456789abcdef01",
            to: "0x9876543210987654321098765432109876543210",
            hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            value: "1500000000000000000",
            gas: "21000",
            gasPrice: "100000000",
            gasUsed: "21000",
            timestamp: "2024-01-24T10:30:15Z",
            status: "1",
            blockNumber: "123456789",
            blockHash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321"
          }]
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_TRANSACTIONS_BY_HASH_ANKR") {
      return true;
    }
    logGranular6("Validating GET_TRANSACTIONS_BY_HASH_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      const parsedContent = parseAPIContent(content.text);
      if (!parsedContent.chain || !parsedContent.txHash) {
        throw new ValidationError("Blockchain and transaction hash are required");
      }
      if (!/^0x[a-fA-F0-9]{64}$/.test(parsedContent.txHash)) {
        throw new ValidationError("Invalid transaction hash format");
      }
      logGranular6("Validation successful");
      return true;
    } catch (error) {
      logGranular6("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular6("Executing GET_TRANSACTIONS_BY_HASH_ANKR action");
    try {
      const messageContent = message.content;
      console.log("Debug - Full message content:", {
        fullContent: message.content,
        rawText: messageContent?.text,
        type: message.content?.type,
        allKeys: Object.keys(message.content || {})
      });
      console.log("Debug - Message content details:", {
        hasText: !!messageContent?.text,
        hasFilters: !!messageContent?.filters,
        textContent: messageContent?.text,
        contentType: typeof messageContent?.text
      });
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      console.log("Debug - Raw prompt:", {
        text: messageContent.text,
        promptLength: messageContent.text?.length
      });
      const parsedContent = parseAPIContent(messageContent.text);
      console.log("Debug - Parsed API content:", {
        hasTx: !!parsedContent.txHash,
        hasChain: !!parsedContent.chain,
        tx: parsedContent.txHash,
        chain: parsedContent.chain
      });
      validateRequiredFields(parsedContent, ["txHash", "chain"]);
      try {
        const response = await axios6.post(
          endpoint,
          {
            jsonrpc: "2.0",
            method: "ankr_getTransactionsByHash",
            params: {
              blockchain: parsedContent.chain,
              transactionHash: parsedContent.txHash,
              includeLogs: true
            },
            id: 1
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        if (response.data.error) {
          throw new APIError(`Ankr API error: ${response.data.error.message}`);
        }
        const transaction = response.data.result.transactions[0];
        const timestamp = new Date(Number.parseInt(transaction.timestamp, 16) * 1e3).toLocaleString();
        const value = Number.parseInt(transaction.value, 16) / 1e18;
        const gasPrice = Number.parseInt(transaction.gasPrice, 16) / 1e9;
        const gasUsed = Number.parseInt(transaction.gasUsed, 16);
        const blockNumber = Number.parseInt(transaction.blockNumber, 16);
        const status = transaction.status === "0x1" ? "Success" : "Failed";
        let formattedText = `Transaction Details on ${parsedContent.chain?.toUpperCase() || "UNKNOWN"}:

`;
        formattedText += `Hash: ${transaction.hash}
`;
        formattedText += `Status: ${status}
`;
        formattedText += `From: ${transaction.from.slice(0, 6)}...${transaction.from.slice(-4)}
`;
        formattedText += `To: ${transaction.to.slice(0, 6)}...${transaction.to.slice(-4)}
`;
        formattedText += `Value: ${value.toFixed(6)} ETH
`;
        formattedText += `Gas Used: ${gasUsed.toLocaleString()}
`;
        formattedText += `Gas Price: ${gasPrice.toFixed(2)} Gwei
`;
        formattedText += `Block: ${blockNumber.toLocaleString()}
`;
        formattedText += `Time: ${timestamp}`;
        if (callback) {
          callback({
            text: formattedText,
            success: true,
            data: response.data.result
          });
        }
        return true;
      } catch (error) {
        logGranular6("API request failed", { error });
        if (axios6.isAxiosError(error)) {
          throw new APIError(
            `Failed to fetch transaction: ${error.message}`,
            error.response?.status
          );
        }
        throw new APIError("Failed to fetch transaction");
      }
    } catch (error) {
      logGranular6("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting transaction: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_TRANSACTIONS_BY_HASH_ANKR action");
    }
  }
};

// src/actions/actionGetBlockchainStats.ts
import { elizaLogger as elizaLogger8 } from "@elizaos/core";
import axios7 from "axios";
var config7 = getConfig();
var GRANULAR_LOG7 = config7.ANKR_GRANULAR_LOG;
var logGranular7 = (message, data) => {
  if (GRANULAR_LOG7) {
    elizaLogger8.debug(`[GetBlockchainStats] ${message}`, data);
    console.log(`[GetBlockchainStats] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetBlockchainStats = {
  name: "GET_BLOCKCHAIN_STATS_ANKR",
  similes: ["CHAIN_STATS", "BLOCKCHAIN_INFO", "NETWORK_STATS", "CHAIN_METRICS"],
  description: "Retrieve statistical information about specified blockchain networks.",
  examples: [[
    {
      user: "user",
      content: {
        text: "Show me stats for [chain]eth[/chain] blockchain",
        filters: {
          blockchain: ["eth"]
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "Here are the current statistics for Ethereum:\n\nLatest Block: 19,234,567\nTotal Transactions: 2.5B\nActive Accounts: 245M\nTPS: 15.5\nGas Price: 25 Gwei\nMarket Cap: $250B\nTotal Value Locked: $45B",
        success: true,
        data: {
          stats: [{
            blockchain: "eth",
            latestBlock: 19234567,
            totalTransactions: "2500000000",
            totalAccounts: "245000000",
            tps: 15.5,
            gasPrice: "25000000000",
            marketCap: "250000000000",
            totalValueLocked: "45000000000"
          }]
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_BLOCKCHAIN_STATS_ANKR") {
      return true;
    }
    logGranular7("Validating GET_BLOCKCHAIN_STATS_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      if (content.filters?.blockchain && !Array.isArray(content.filters.blockchain)) {
        throw new ValidationError("Blockchain must be an array");
      }
      logGranular7("Validation successful");
      return true;
    } catch (error) {
      logGranular7("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular7("Executing GET_BLOCKCHAIN_STATS_ANKR action");
    try {
      const messageContent = message.content;
      console.log("Debug - Full message content:", {
        fullContent: message.content,
        rawText: messageContent?.text,
        type: message.content?.type,
        allKeys: Object.keys(message.content || {})
      });
      console.log("Debug - Message content details:", {
        hasText: !!messageContent?.text,
        hasFilters: !!messageContent?.filters,
        textContent: messageContent?.text,
        contentType: typeof messageContent?.text
      });
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      console.log("Debug - Raw prompt:", {
        text: messageContent.text,
        promptLength: messageContent.text?.length
      });
      const parsedContent = parseAPIContent(messageContent.text);
      console.log("Debug - Parsed API content:", {
        hasChain: !!parsedContent.chain,
        chain: parsedContent.chain,
        matches: parsedContent.raw.matches
      });
      validateRequiredFields(parsedContent, ["chain"]);
      const requestParams = {
        blockchain: parsedContent.chain
        // Changed from array to string
      };
      console.log("Debug - API request parameters:", {
        params: requestParams,
        endpoint: ANKR_ENDPOINTS.production.multichain
      });
      try {
        const response = await axios7.post(
          endpoint,
          {
            jsonrpc: "2.0",
            method: "ankr_getBlockchainStats",
            params: requestParams,
            id: 1
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        logGranular7("Received response from Ankr API", {
          statusCode: response.status,
          data: response.data
        });
        if (response.data.error) {
          throw new APIError(`Ankr API error: ${response.data.error.message}`);
        }
        const stats = response.data.result.stats;
        let formattedText = "";
        for (const stat of stats) {
          formattedText += `Statistics for ${stat.blockchain.toUpperCase()}:

`;
          formattedText += `Latest Block: ${stat.latestBlockNumber.toLocaleString()}
`;
          formattedText += `Total Transactions: ${(stat.totalTransactionsCount / 1e9).toFixed(1)}B
`;
          formattedText += `Total Events: ${(stat.totalEventsCount / 1e9).toFixed(1)}B
`;
          formattedText += `Block Time: ${(stat.blockTimeMs / 1e3).toFixed(1)} seconds
`;
          formattedText += `Native Coin Price: $${Number(stat.nativeCoinUsdPrice).toFixed(2)}

`;
        }
        if (callback) {
          logGranular7("Sending success callback with formatted text", { formattedText });
          callback({
            text: formattedText,
            success: true,
            data: {
              stats: stats.map((stat) => ({
                blockchain: stat.blockchain,
                latestBlock: stat.latestBlockNumber,
                totalTransactions: stat.totalTransactionsCount.toString(),
                totalEvents: stat.totalEventsCount.toString(),
                blockTime: stat.blockTimeMs / 1e3,
                nativeCoinPrice: stat.nativeCoinUsdPrice
              }))
            }
          });
        }
        return true;
      } catch (error) {
        logGranular7("API request failed", { error });
        if (axios7.isAxiosError(error)) {
          throw new APIError(
            `Failed to fetch blockchain stats: ${error.message}`,
            error.response?.status
          );
        }
        throw new APIError("Failed to fetch blockchain stats");
      }
    } catch (error) {
      logGranular7("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting blockchain stats: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_BLOCKCHAIN_STATS_ANKR action");
    }
  }
};

// src/actions/actionGetCurrencies.ts
import { elizaLogger as elizaLogger9 } from "@elizaos/core";
import axios8 from "axios";
var config8 = getConfig();
var GRANULAR_LOG8 = config8.ANKR_GRANULAR_LOG;
var logGranular8 = (message, data) => {
  if (GRANULAR_LOG8) {
    elizaLogger9.debug(`[GetCurrencies] ${message}`, data);
    console.log(`[GetCurrencies] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetCurrencies = {
  name: "GET_CURRENCIES_ANKR",
  similes: ["LIST_CURRENCIES", "SHOW_CURRENCIES", "VIEW_CURRENCIES", "FETCH_CURRENCIES"],
  description: "Retrieve information about currencies on specified blockchain networks.",
  examples: [[
    {
      user: "user",
      content: {
        text: "Show me the top currencies on [chain]eth[/chain]",
        filters: {
          blockchain: "eth",
          pageSize: 5,
          pageToken: "eyJsYXN0X2JhbGFuY2UiOiIyIn0="
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "Here are the top currencies on Ethereum:\n\n1. Ethereum (ETH)\n   Market Cap: $250B\n   Holders: 2.5M\n   Total Supply: 120.5M ETH\n\n2. USD Coin (USDC)\n   Contract: 0xa0b8...c4d5\n   Market Cap: $45B\n   Holders: 1.2M\n   Total Supply: 45B USDC",
        success: true,
        data: {
          currencies: [
            {
              blockchain: "eth",
              address: "0x0000000000000000000000000000000000000000",
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18
            }
          ]
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_CURRENCIES_ANKR") {
      return true;
    }
    logGranular8("Validating GET_CURRENCIES_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      if (!content.filters?.blockchain) {
        throw new ValidationError("Blockchain is required");
      }
      logGranular8("Validation successful");
      return true;
    } catch (error) {
      logGranular8("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular8("Executing GET_CURRENCIES_ANKR action");
    try {
      const messageContent = message.content;
      console.log("Debug - Full message content:", {
        fullContent: message.content,
        rawText: messageContent?.text,
        type: message.content?.type,
        allKeys: Object.keys(message.content || {})
      });
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      console.log("Debug - Raw prompt:", {
        text: messageContent.text,
        promptLength: messageContent.text?.length
      });
      const parsedContent = parseAPIContent(messageContent.text);
      console.log("Debug - Parsed API content:", {
        hasChain: !!parsedContent.chain,
        chain: parsedContent.chain,
        matches: parsedContent.raw.matches
      });
      validateRequiredFields(parsedContent, ["chain"]);
      const requestParams = {
        blockchain: parsedContent.chain,
        pageSize: messageContent.filters?.pageSize ?? 5
      };
      console.log("Debug - API request parameters:", {
        params: requestParams,
        endpoint: ANKR_ENDPOINTS.production.multichain
      });
      try {
        const response = await axios8.post(
          endpoint,
          {
            jsonrpc: "2.0",
            method: "ankr_getCurrencies",
            params: requestParams,
            id: 1
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        logGranular8("Received response from Ankr API", {
          statusCode: response.status,
          data: response.data
        });
        if (response.data.error) {
          throw new APIError(`Ankr API error: ${response.data.error.message}`);
        }
        const currencies = response.data.result.currencies;
        let formattedText = `Here are the top currencies from ${parsedContent.chain ? parsedContent.chain[0].toUpperCase() : "Unknown Chain"}:

`;
        let index = 0;
        for (const currency of currencies) {
          formattedText += [
            `${index + 1}. ${currency.name} (${currency.symbol})`,
            currency.address ? `   Contract: ${currency.address.slice(0, 6)}...${currency.address.slice(-4)}` : "",
            `   Decimals: ${currency.decimals}`,
            currency.thumbnail ? `   Logo: ${currency.thumbnail}` : "",
            "",
            ""
          ].filter(Boolean).join("\n");
          index++;
        }
        if (callback) {
          logGranular8("Sending success callback with formatted text", { formattedText });
          callback({
            text: formattedText,
            success: true,
            data: {
              currencies,
              syncStatus: response.data.result.syncStatus
            }
          });
        }
        return true;
      } catch (error) {
        logGranular8("API request failed", { error });
        if (axios8.isAxiosError(error)) {
          throw new APIError(
            `Failed to fetch currencies data: ${error.message}`,
            error.response?.status
          );
        }
        throw new APIError("Failed to fetch currencies data");
      }
    } catch (error) {
      logGranular8("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting currencies: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_CURRENCIES_ANKR action");
    }
  }
};

// src/actions/actionGetInteractions.ts
import { elizaLogger as elizaLogger10 } from "@elizaos/core";
import axios9 from "axios";
var config9 = getConfig();
var GRANULAR_LOG9 = config9.ANKR_GRANULAR_LOG;
var logGranular9 = (message, data) => {
  if (GRANULAR_LOG9) {
    elizaLogger10.debug(`[GetInteractions] ${message}`, data);
    console.log(`[GetInteractions] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetInteractions = {
  name: "GET_INTERACTIONS_ANKR",
  similes: ["FETCH_INTERACTIONS", "SHOW_INTERACTIONS", "VIEW_INTERACTIONS", "LIST_INTERACTIONS"],
  description: "Retrieve interactions between wallets and smart contracts on specified blockchain networks.",
  examples: [[
    {
      user: "user",
      content: {
        text: "Show me interactions for the wallet [wallet]0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45[/wallet]",
        filters: {
          blockchain: "eth",
          // Changed from string[] to string
          address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
          pageSize: 5,
          pageToken: "eyJsYXN0X2Jsb2NrIjoiMTIzNDU2Nzg4IiwibGFzdF9pbnRlcmFjdGlvbl9pbmRleCI6IjEifQ=="
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "Here are the recent interactions:\n\n1. Transfer (2024-03-15 14:30 UTC)\n   From: 0xabc...def1\n   To: 0x123...5678\n   Value: 1.5 ETH\n   Gas Used: 21,000\n   Tx Hash: 0xdef...789\n\n2. Approve (2024-03-15 14:25 UTC)\n   From: 0xabc...def1\n   To: 0x123...5678\n   Value: 0 ETH\n   Gas Used: 45,000\n   Tx Hash: 0x789...012",
        success: true,
        data: {
          interactions: [{
            blockchain: "eth",
            transactionHash: "0xdef...789",
            blockNumber: 17000100,
            timestamp: "2024-03-15T14:30:00Z",
            from: "0xabcdef1234567890abcdef1234567890abcdef12",
            to: "0x1234567890abcdef1234567890abcdef12345678",
            value: "1500000000000000000",
            gasPrice: "20000000000",
            gasUsed: "21000",
            methodName: "transfer",
            logs: [{
              address: "0x1234567890abcdef1234567890abcdef12345678",
              topics: ["0x000...123"],
              data: "0x000...456",
              logIndex: 0
            }]
          }]
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_INTERACTIONS_ANKR") {
      return true;
    }
    logGranular9("Validating GET_INTERACTIONS_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      if (!content.filters?.address) {
        throw new ValidationError("Wallet address is required");
      }
      logGranular9("Validation successful");
      return true;
    } catch (error) {
      logGranular9("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular9("Executing GET_INTERACTIONS_ANKR action");
    try {
      const messageContent = message.content;
      const parsedContent = parseAPIContent(messageContent.text);
      validateRequiredFields(parsedContent, ["wallet"]);
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      const requestParams = {
        blockchain: parsedContent.chain || "eth",
        address: parsedContent.wallet,
        pageSize: messageContent.filters?.pageSize ?? 5,
        pageToken: messageContent.filters?.pageToken
      };
      try {
        const response = await axios9.post(
          endpoint,
          {
            jsonrpc: "2.0",
            method: "ankr_getInteractions",
            params: requestParams,
            id: 1
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        logGranular9("Received response from Ankr API", {
          statusCode: response.status,
          data: response.data
        });
        const formattedText = `Blockchain Status Information:

Available Blockchains: ${response.data.result.blockchains.join(", ")}
Sync Status: ${response.data.result.syncStatus.status}
Lag: ${response.data.result.syncStatus.lag}`;
        if (callback) {
          callback({
            text: formattedText,
            success: true,
            data: {
              interactions: [],
              syncStatus: response.data.result.syncStatus,
              availableBlockchains: response.data.result.blockchains
            }
          });
        }
        return true;
      } catch (error) {
        logGranular9("API request failed", { error });
        if (axios9.isAxiosError(error)) {
          throw new APIError(
            `Failed to fetch interactions data: ${error.message}`,
            error.response?.status
          );
        }
        throw new APIError("Failed to fetch interactions data");
      }
    } catch (error) {
      logGranular9("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting interactions: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_INTERACTIONS_ANKR action");
    }
  }
};

// src/actions/actionGetNFTHolders.ts
import { elizaLogger as elizaLogger11 } from "@elizaos/core";
import axios10 from "axios";
var config10 = getConfig();
var GRANULAR_LOG10 = config10.ANKR_GRANULAR_LOG;
var logGranular10 = (message, data) => {
  if (GRANULAR_LOG10) {
    elizaLogger11.debug(`[GetNFTHolders] ${message}`, data);
    console.log(`[GetNFTHolders] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetNFTHolders = {
  name: "GET_NFT_HOLDERS_ANKR",
  similes: ["FETCH_NFT_HOLDERS", "SHOW_NFT_HOLDERS", "VIEW_NFT_HOLDERS", "LIST_NFT_HOLDERS"],
  description: "Retrieve holders of specific NFTs on specified blockchain networks.",
  examples: [[
    {
      user: "user",
      content: {
        text: "Show me holders of NFT contract [contract]0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258[/contract] on [chain]bsc[/chain]",
        filters: {
          blockchain: "bsc",
          // Changed from string[] to string
          contractAddress: "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258",
          pageSize: 5
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "Here are the NFT holders:\n\n1. 0xabc...def1\n   Balance: 1.5\n   Raw Balance: 1500000000000000000\n\n2. 0xdef...789a\n   Balance: 2.0\n   Raw Balance: 2000000000000000000",
        success: true,
        data: {
          holders: [{
            holderAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
            balance: "1.5",
            balanceRawInteger: "1500000000000000000"
          }],
          blockchain: "bsc",
          contractAddress: "0xf307910A4c7bbc79691fD374889b36d8531B08e3",
          tokenDecimals: 18,
          holdersCount: 1e3,
          syncStatus: {
            timestamp: 1737769593,
            lag: "-2m",
            status: "synced"
          }
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_NFT_HOLDERS_ANKR") {
      return true;
    }
    logGranular10("Validating GET_NFT_HOLDERS_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      if (!content.filters?.contractAddress) {
        throw new ValidationError("Contract address is required");
      }
      if (content.filters?.blockchain && typeof content.filters.blockchain !== "string") {
        throw new ValidationError("Blockchain must be a string");
      }
      logGranular10("Validation successful");
      return true;
    } catch (error) {
      logGranular10("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular10("Executing GET_NFT_HOLDERS_ANKR action");
    try {
      const messageContent = message.content;
      console.log("Debug - Full message content:", {
        fullContent: message.content,
        rawText: messageContent?.text,
        type: message.content?.type,
        allKeys: Object.keys(message.content || {})
      });
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      console.log("Debug - Raw prompt:", {
        text: messageContent.text,
        promptLength: messageContent.text?.length
      });
      const parsedContent = parseAPIContent(messageContent.text);
      console.log("Debug - Parsed API content:", {
        hasContract: !!parsedContent.contract,
        hasToken: !!parsedContent.token,
        hasChain: !!parsedContent.chain,
        contract: parsedContent.contract,
        token: parsedContent.token,
        chain: parsedContent.chain,
        matches: parsedContent.raw.matches
      });
      validateRequiredFields(parsedContent, ["contract"]);
      const requestParams = {
        blockchain: parsedContent.chain,
        contractAddress: parsedContent.contract,
        pageSize: messageContent.filters?.pageSize || 10,
        pageToken: messageContent.filters?.pageToken
      };
      console.log("Debug - API request parameters:", {
        params: requestParams,
        endpoint
      });
      const response = await axios10.post(
        endpoint,
        {
          jsonrpc: "2.0",
          method: "ankr_getNFTHolders",
          params: requestParams,
          id: 1
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      logGranular10("Received response from Ankr API", {
        statusCode: response.status,
        data: response.data
      });
      const result = response.data.result;
      const formattedText = `NFT Holders:
Total Holders: ${result.holders.length}

${result.holders.map(
        (holderAddress, index) => `${index + 1}. ${holderAddress}`
      ).join("\n")}

${result.nextPageToken ? "More holders available. Use the page token to see more.\n" : ""}
${result.syncStatus ? `Sync Status:
Last Update: ${new Date(result.syncStatus.timestamp * 1e3).toLocaleString()}
Lag: ${result.syncStatus.lag}
Status: ${result.syncStatus.status}` : ""}`;
      logGranular10("Formatted response text", { formattedText });
      if (callback) {
        logGranular10("Sending success callback with formatted text");
        callback({
          text: formattedText,
          success: true,
          data: {
            holders: result.holders.map((address) => ({
              holderAddress: address,
              balance: "1",
              // Default values since not provided in response
              balanceRawInteger: "1"
            })),
            nextPageToken: result.nextPageToken,
            syncStatus: result.syncStatus
          }
        });
      }
      return true;
    } catch (error) {
      logGranular10("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting NFT holders: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_NFT_HOLDERS_ANKR action");
    }
  }
};

// src/actions/actionGetNFTTransfers.ts
import { elizaLogger as elizaLogger12 } from "@elizaos/core";
import axios11 from "axios";
var config11 = getConfig();
var GRANULAR_LOG11 = config11.ANKR_GRANULAR_LOG;
var logGranular11 = (message, data) => {
  if (GRANULAR_LOG11) {
    elizaLogger12.debug(`[GetNFTTransfers] ${message}`, data);
    console.log(`[GetNFTTransfers] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetNFTTransfers = {
  name: "GET_NFT_TRANSFERS_ANKR",
  similes: ["LIST_NFT_TRANSFERS", "SHOW_NFT_TRANSFERS", "VIEW_NFT_TRANSFERS", "GET_NFT_HISTORY"],
  description: "Get NFT transfer history for a specific address or contract on eth.",
  // Fix the example data to match the interface
  examples: [[
    {
      user: "user",
      content: {
        text: "Show me NFT transfers for contract [contract]0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258[/contract] [chain]eth[/chain] [fromtimestamp]1655197483[/fromtimestamp][totimestamp]1671974699[/totimestamp]",
        filters: {
          blockchain: "eth",
          contractAddress: "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258",
          pageSize: 5
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "NFT Transfers:\n\n1. Transfer of Token #1234\n   From: 0xabcd...ef01\n   To: 0x9876...4321\n   Time: 1/24/2024, 10:30:15 AM\n   Token: CoolNFT #123\n\n2. Transfer of Token #456\n   From: 0x9876...3210\n   To: 0xfedc...ba98\n   Time: 1/24/2024, 10:15:22 AM\n   Token: CoolNFT #456\n",
        success: true,
        data: {
          transfers: [
            {
              fromAddress: "0xabcdef0123456789abcdef0123456789abcdef01",
              toAddress: "0x9876543210fedcba9876543210fedcba98765432",
              contractAddress: "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258",
              value: "1",
              valueRawInteger: "1",
              blockchain: "eth",
              tokenName: "CoolNFT",
              tokenSymbol: "COOL",
              tokenDecimals: 18,
              thumbnail: "https://example.com/nft/123.png",
              transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
              blockHeight: 123456789,
              timestamp: 1706093415
            },
            {
              fromAddress: "0x9876543210987654321098765432109876543210",
              toAddress: "0xfedcba9876543210fedcba9876543210fedcba98",
              contractAddress: "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258",
              value: "1",
              valueRawInteger: "1",
              blockchain: "eth",
              tokenName: "CoolNFT",
              tokenSymbol: "COOL",
              tokenDecimals: 18,
              thumbnail: "https://example.com/nft/456.png",
              transactionHash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
              blockHeight: 123456788,
              timestamp: 1706092522
            }
          ],
          syncStatus: {
            timestamp: 1706093415,
            lag: "0s",
            status: "synced"
          }
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_NFT_TRANSFERS_ANKR") {
      return true;
    }
    logGranular11("Validating GET_NFT_TRANSFERS_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      if (!content.filters?.blockchain || !content.filters?.contractAddress) {
        throw new ValidationError("Blockchain and contract address are required");
      }
      logGranular11("Validation successful");
      return true;
    } catch (error) {
      logGranular11("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular11("Executing GET_NFT_TRANSFERS_ANKR action");
    try {
      const messageContent = message.content;
      console.log("Debug - Full message content:", {
        fullContent: message.content,
        rawText: messageContent?.text,
        type: message.content?.type,
        allKeys: Object.keys(message.content || {})
      });
      console.log("Debug - Message content details:", {
        hasText: !!messageContent?.text,
        hasFilters: !!messageContent?.filters,
        textContent: messageContent?.text,
        contentType: typeof messageContent?.text
      });
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      console.log("Debug - Raw prompt:", {
        text: messageContent.text,
        promptLength: messageContent.text?.length
      });
      const parsedContent = parseAPIContent(messageContent.text);
      console.log("Debug - Parsed API content:", {
        hasContract: !!parsedContent.contract,
        hasChain: !!parsedContent.chain,
        hasFromTimestamp: !!parsedContent.fromTimestamp,
        hasToTimestamp: !!parsedContent.toTimestamp,
        contract: parsedContent.contract,
        chain: parsedContent.chain,
        fromTimestamp: parsedContent.fromTimestamp,
        toTimestamp: parsedContent.toTimestamp,
        matches: parsedContent.raw.matches
      });
      validateRequiredFields(parsedContent, ["contract", "chain", "fromTimestamp", "toTimestamp"]);
      const requestParams = {
        address: parsedContent.contract,
        blockchain: [parsedContent.chain],
        fromTimestamp: parsedContent.fromTimestamp,
        toTimestamp: parsedContent.toTimestamp
      };
      console.log("Debug - API request parameters:", {
        params: requestParams,
        endpoint: ANKR_ENDPOINTS.production.multichain
      });
      try {
        const response = await axios11.post(
          endpoint,
          {
            jsonrpc: "2.0",
            method: "ankr_getTokenTransfers",
            params: requestParams,
            id: 1
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        logGranular11("Received response from Ankr API", {
          statusCode: response.status,
          data: response.data
        });
        if (response.data.error) {
          throw new APIError(`Ankr API error: ${response.data.error.message}`);
        }
        const transfers = response.data.result.transfers;
        let formattedText = "Token Transfers:\n\n";
        transfers.forEach((transfer, index) => {
          formattedText += `${index + 1}. Transfer of ${transfer.tokenName} (${transfer.tokenSymbol})
`;
          formattedText += `   From: ${transfer.fromAddress.slice(0, 6)}...${transfer.fromAddress.slice(-4)}
`;
          formattedText += `   To: ${transfer.toAddress.slice(0, 6)}...${transfer.toAddress.slice(-4)}
`;
          formattedText += `   Amount: ${transfer.value}
`;
          formattedText += `   Time: ${new Date(transfer.timestamp * 1e3).toLocaleString()}
`;
          formattedText += `   Tx Hash: ${transfer.transactionHash}
`;
          if (transfer.thumbnail) {
            formattedText += `   Token Icon: ${transfer.thumbnail}
`;
          }
          formattedText += "\n";
        });
        if (callback) {
          logGranular11("Sending success callback with formatted text", { formattedText });
          callback({
            text: formattedText,
            success: true,
            data: {
              transfers,
              syncStatus: response.data.result.syncStatus
            }
          });
        }
        return true;
      } catch (error) {
        logGranular11("API request failed", { error });
        if (axios11.isAxiosError(error)) {
          throw new APIError(
            `Failed to fetch NFT transfers: ${error.message}`,
            error.response?.status
          );
        }
        throw new APIError("Failed to fetch NFT transfers");
      }
    } catch (error) {
      logGranular11("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting NFT transfers: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_NFT_TRANSFERS_ANKR action");
    }
  }
};

// src/actions/actionGetNFTMetadata.ts
import { elizaLogger as elizaLogger13 } from "@elizaos/core";
import axios12 from "axios";
var config12 = getConfig();
var GRANULAR_LOG12 = config12.ANKR_GRANULAR_LOG;
var logGranular12 = (message, data) => {
  if (GRANULAR_LOG12) {
    elizaLogger13.debug(`[GetNFTMetadata] ${message}`, data);
    console.log(`[GetNFTMetadata] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetNFTMetadata = {
  name: "GET_NFT_METADATA_ANKR",
  similes: ["GET_NFT_INFO", "SHOW_NFT_DETAILS", "VIEW_NFT", "NFT_METADATA"],
  description: "Get detailed metadata for a specific NFT including traits, images, and contract information.",
  examples: [[
    {
      user: "user",
      content: {
        text: "Show me the metadata for NFT [token]1234[/token] at contract [contract]0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d[/contract] [chain]eth[/chain]",
        filters: {
          blockchain: "eth",
          contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
          tokenId: "1234"
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "NFT Metadata for Bored Ape #1234:\n\nCollection: Bored Ape Yacht Club\nContract: 0xbc4c...f13d (ERC721)\n\nDescription: A unique Bored Ape NFT living on the Ethereum blockchain\n\nTraits:\n- Background: Blue\n- Fur: Dark Brown\n- Eyes: Bored\n- Mouth: Grin\n",
        success: true,
        data: {
          metadata: {
            blockchain: "eth",
            contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
            contractType: "ERC721",
            tokenId: "1234"
          },
          attributes: {
            contractType: "ERC721",
            tokenUrl: "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1234",
            imageUrl: "ipfs://QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ",
            name: "Bored Ape #1234",
            description: "A unique Bored Ape NFT living on the Ethereum blockchain",
            traits: [
              { trait_type: "Background", value: "Blue" },
              { trait_type: "Fur", value: "Dark Brown" },
              { trait_type: "Eyes", value: "Bored" },
              { trait_type: "Mouth", value: "Grin" }
            ]
          }
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_NFT_METADATA_ANKR") {
      return true;
    }
    logGranular12("Validating GET_NFT_METADATA_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      if (!content.filters?.blockchain || !content.filters?.contractAddress || !content.filters?.tokenId) {
        throw new ValidationError("Blockchain, contract address, and token ID are required");
      }
      logGranular12("Validation successful");
      return true;
    } catch (error) {
      logGranular12("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular12("Executing GET_NFT_METADATA_ANKR action");
    try {
      const messageContent = message.content;
      console.log("Debug - Full message content:", {
        fullContent: message.content,
        rawText: messageContent?.text,
        type: message.content?.type,
        allKeys: Object.keys(message.content || {})
      });
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      console.log("Debug - Raw prompt:", {
        text: messageContent.text,
        promptLength: messageContent.text?.length
      });
      const parsedContent = parseAPIContent(messageContent.text);
      console.log("Debug - Parsed API content:", {
        hasContract: !!parsedContent.contract,
        hasToken: !!parsedContent.token,
        hasChain: !!parsedContent.chain,
        contract: parsedContent.contract,
        token: parsedContent.token,
        chain: parsedContent.chain,
        matches: parsedContent.raw.matches
      });
      validateRequiredFields(parsedContent, ["contract", "token", "chain"]);
      const requestParams = {
        blockchain: parsedContent.chain,
        contractAddress: parsedContent.contract,
        tokenId: parsedContent.token
      };
      console.log("Debug - API request parameters:", {
        params: requestParams,
        endpoint: ANKR_ENDPOINTS.production.multichain
      });
      try {
        const response = await axios12.post(
          endpoint,
          {
            jsonrpc: "2.0",
            method: "ankr_getNFTMetadata",
            params: requestParams,
            id: 1
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        logGranular12("Received response from Ankr API", {
          statusCode: response.status,
          data: response.data
        });
        if (response.data.error) {
          throw new APIError(`Ankr API error: ${response.data.error.message}`);
        }
        const nftData = response.data.result;
        let formattedText = `NFT Metadata for ${nftData.attributes.name}:

`;
        formattedText += `Collection: ${nftData.attributes.name.split("#")[0].trim()}
`;
        formattedText += `Contract: ${nftData.metadata.contractAddress.slice(0, 6)}...${nftData.metadata.contractAddress.slice(-4)} (${nftData.metadata.contractType})

`;
        if (nftData.attributes.description) {
          formattedText += `Description: ${nftData.attributes.description}

`;
        }
        if (nftData.attributes.traits && nftData.attributes.traits.length > 0) {
          formattedText += "Traits:\n";
          for (const trait of nftData.attributes.traits) {
            formattedText += `- ${trait.trait_type}: ${trait.value}
`;
          }
        }
        if (nftData.attributes.imageUrl) {
          formattedText += `
Image URL: ${nftData.attributes.imageUrl}
`;
        }
        if (callback) {
          logGranular12("Sending success callback with formatted text", { formattedText });
          callback({
            text: formattedText,
            success: true,
            data: nftData
          });
        }
        return true;
      } catch (error) {
        logGranular12("API request failed", { error });
        if (axios12.isAxiosError(error)) {
          throw new APIError(
            `Failed to fetch NFT metadata: ${error.message}`,
            error.response?.status
          );
        }
        throw new APIError("Failed to fetch NFT metadata");
      }
    } catch (error) {
      logGranular12("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting NFT metadata: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_NFT_METADATA_ANKR action");
    }
  }
};

// src/actions/actionGetNFTsByOwner.ts
import { elizaLogger as elizaLogger14 } from "@elizaos/core";
import axios13 from "axios";
var config13 = getConfig();
var GRANULAR_LOG13 = config13.ANKR_GRANULAR_LOG;
var logGranular13 = (message, data) => {
  if (GRANULAR_LOG13) {
    elizaLogger14.debug(`[GetNFTsByOwner] ${message}`, data);
    console.log(`[GetNFTsByOwner] ${message}`, data ? JSON.stringify(data, null, 2) : "");
  }
};
var actionGetNFTsByOwner = {
  name: "GET_NFTS_BY_OWNER_ANKR",
  similes: ["LIST_NFTS", "SHOW_NFTS", "VIEW_NFTS", "FETCH_NFTS", "GET_OWNED_NFTS"],
  description: "Retrieve all NFTs owned by a specific wallet address across multiple blockchains with detailed metadata.",
  examples: [[
    {
      user: "user",
      content: {
        text: "Show me all NFTs owned by wallet [wallet]0x1234567890123456789012345678901234567890[/wallet] on [chain]eth[/chain]",
        filters: {
          blockchain: ["eth"],
          walletAddress: "0x1234567890123456789012345678901234567890",
          pageSize: 10
        }
      }
    },
    {
      user: "assistant",
      content: {
        text: "NFTs owned by 0x1234567890123456789012345678901234567890:\n\n1. Bored Ape #1234\n   Collection: Bored Ape Yacht Club\n   Contract: 0xbc4c...f13d\n   Token ID: 1234\n\n2. CryptoPunk #5678\n   Collection: CryptoPunks\n   Contract: 0x2505...42a2\n   Token ID: 5678\n",
        success: true,
        data: {
          owner: "0x1234567890123456789012345678901234567890",
          assets: [
            {
              blockchain: "eth",
              name: "Bored Ape #1234",
              tokenId: "1234",
              tokenUrl: "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1234",
              imageUrl: "ipfs://QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ",
              collectionName: "Bored Ape Yacht Club",
              symbol: "BAYC",
              contractType: "ERC721",
              contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
            },
            {
              blockchain: "eth",
              name: "CryptoPunk #5678",
              tokenId: "5678",
              tokenUrl: "https://cryptopunks.app/cryptopunks/details/5678",
              imageUrl: "https://cryptopunks.app/cryptopunks/image/5678",
              collectionName: "CryptoPunks",
              symbol: "PUNK",
              contractType: "ERC721",
              contractAddress: "0x2505...42a2"
            }
          ]
        }
      }
    }
  ]],
  // ------------------------------------------------------------------------------------------------
  // Core Validation implementation
  // ------------------------------------------------------------------------------------------------
  validate: async (_runtime, message) => {
    if (message.content?.type !== "GET_NFTS_BY_OWNER_ANKR") {
      return true;
    }
    logGranular13("Validating GET_NFTS_BY_OWNER_ANKR action", {
      content: message.content
    });
    try {
      const content = message.content;
      if (!content.filters?.blockchain || !content.filters?.walletAddress) {
        throw new ValidationError("Blockchain and wallet address are required");
      }
      if (content.filters?.blockchain && !Array.isArray(content.filters.blockchain)) {
        throw new ValidationError("Blockchain must be an array");
      }
      logGranular13("Validation successful");
      return true;
    } catch (error) {
      logGranular13("Validation failed", { error });
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(error instanceof Error ? error.message : "Unknown validation error");
    }
  },
  // ------------------------------------------------------------------------------------------------
  // Core Handler implementation
  // ------------------------------------------------------------------------------------------------
  handler: async (runtime, message, _state, _options = {}, callback) => {
    logGranular13("Executing GET_NFTS_BY_OWNER_ANKR action");
    try {
      const messageContent = message.content;
      console.log("Debug - Full message content:", {
        fullContent: message.content,
        rawText: messageContent?.text,
        type: message.content?.type
      });
      const config14 = await validateankrConfig(runtime);
      console.log("Debug - Config validated:", {
        hasWallet: !!config14.ANKR_WALLET,
        env: config14.ANKR_ENV
      });
      const wallet = config14.ANKR_WALLET;
      if (!wallet) {
        throw new ConfigurationError("ANKR_WALLET not found in environment variables");
      }
      const endpoint = `https://rpc.ankr.com/multichain/${wallet}`;
      const parsedContent = parseAPIContent(messageContent.text);
      console.log("Debug - Parsed API content:", {
        hasWallet: !!parsedContent.wallet,
        hasChain: !!parsedContent.chain,
        wallet: parsedContent.wallet,
        chain: parsedContent.chain,
        matches: parsedContent.raw.matches
      });
      validateRequiredFields(parsedContent, ["wallet", "chain"]);
      const requestParams = {
        blockchain: [parsedContent.chain],
        // API expects array
        walletAddress: parsedContent.wallet,
        pageSize: messageContent.filters?.pageSize ?? 10,
        pageToken: messageContent.filters?.pageToken
      };
      console.log("Debug - API request parameters:", requestParams);
      try {
        const response = await axios13.post(
          endpoint,
          {
            jsonrpc: "2.0",
            method: "ankr_getNFTsByOwner",
            params: requestParams,
            id: 1
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        logGranular13("Received response from Ankr API", {
          statusCode: response.status,
          data: response.data
        });
        if (response.data.error) {
          throw new APIError(`Ankr API error: ${response.data.error.message}`);
        }
        const { owner, assets, syncStatus } = response.data.result;
        let formattedText = `NFTs owned by ${owner}:

`;
        for (const [index, nft] of assets.entries()) {
          formattedText += `${index + 1}. ${nft.name || "Unnamed NFT"}
`;
          if (nft.collectionName) {
            formattedText += `   Collection: ${nft.collectionName}
`;
          }
          formattedText += `   Contract: ${nft.contractAddress.slice(0, 6)}...${nft.contractAddress.slice(-4)} (${nft.contractType})
`;
          formattedText += `   Token ID: ${nft.tokenId}
`;
          if (nft.quantity) {
            formattedText += `   Quantity: ${nft.quantity}
`;
          }
          if (nft.tokenUrl) {
            formattedText += `   Metadata URL: ${nft.tokenUrl}
`;
          }
          formattedText += "\n";
        }
        if (callback) {
          logGranular13("Sending success callback with formatted text", { formattedText });
          callback({
            text: formattedText,
            success: true,
            data: {
              owner,
              assets,
              syncStatus
            }
          });
        }
        return true;
      } catch (error) {
        logGranular13("API request failed", { error });
        if (axios13.isAxiosError(error)) {
          throw new APIError(
            `Failed to fetch NFTs data: ${error.message}`,
            error.response?.status
          );
        }
        throw new APIError("Failed to fetch NFTs data");
      }
    } catch (error) {
      logGranular13("Handler execution failed", { error });
      if (callback) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        callback({
          text: `Error getting NFTs: ${errorMessage}`,
          success: false
        });
      }
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError("Failed to execute GET_NFTS_BY_OWNER_ANKR action");
    }
  }
};

// src/index.ts
var spinner = ora({
  text: chalk.cyan("Initializing ANKR Plugin..."),
  spinner: "dots12",
  color: "cyan"
}).start();
var actions = [
  actionGetTokenHoldersCount,
  actionGetTokenPrice,
  actionGetTokenTransfers,
  actionGetAccountBalance,
  actionGetTransactionsByAddress,
  actionGetTransactionsByHash,
  actionGetBlockchainStats,
  actionGetCurrencies,
  actionGetInteractions,
  actionGetNFTHolders,
  actionGetNFTTransfers,
  actionGetNFTMetadata,
  actionGetNFTsByOwner
];
var ANKR_SPASH = getConfig().ANKR_WALLET;
if (ANKR_SPASH) {
  console.log(`
${chalk.cyan("\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510")}`);
  console.log(chalk.cyan("\u2502") + chalk.yellow.bold("          ANKR PLUGIN             ") + chalk.cyan(" \u2502"));
  console.log(chalk.cyan("\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524"));
  console.log(chalk.cyan("\u2502") + chalk.white("  Initializing ANKR Services...    ") + chalk.cyan("\u2502"));
  console.log(chalk.cyan("\u2502") + chalk.white("  Version: 1.0.0                        ") + chalk.cyan("\u2502"));
  console.log(chalk.cyan("\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518"));
  spinner.succeed(chalk.green("ANKR Plugin initialized successfully!"));
  const actionTable = new Table({
    head: [
      chalk.cyan("Action"),
      chalk.cyan("H"),
      chalk.cyan("V"),
      chalk.cyan("E"),
      chalk.cyan("Similes")
    ],
    style: {
      head: [],
      border: ["cyan"]
    }
  });
  for (const action of actions) {
    actionTable.push([
      chalk.white(action.name),
      typeof action.handler === "function" ? chalk.green("\u2713") : chalk.red("\u2717"),
      typeof action.validate === "function" ? chalk.green("\u2713") : chalk.red("\u2717"),
      action.examples?.length > 0 ? chalk.green("\u2713") : chalk.red("\u2717"),
      chalk.gray(action.similes?.join(", ") || "none")
    ]);
  }
  console.log(`
${actionTable.toString()}`);
  const statusTable = new Table({
    style: {
      border: ["cyan"]
    }
  });
  statusTable.push(
    [chalk.cyan("Plugin Status")],
    [chalk.white("Name    : ") + chalk.yellow("plugin-ankr")],
    [chalk.white("Actions : ") + chalk.green(actions.length.toString())],
    [chalk.white("Status  : ") + chalk.green("Loaded & Ready")]
  );
  console.log(`
${statusTable.toString()}
`);
} else {
  spinner.stop();
}
var ankrPlugin = {
  name: "plugin-ankr",
  description: "Ankr Plugin for web3",
  actions,
  evaluators: []
};
var index_default = ankrPlugin;
export {
  ankrPlugin,
  index_default as default
};
//# sourceMappingURL=index.js.map