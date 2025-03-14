// src/index.ts
import chalk from "chalk";
import Table from "cli-table3";
import ora from "ora";

// src/environment.ts
import { z } from "zod";
var ankrEnvSchema = z.object({
  ANKR_API_KEY: z.string().min(1, "ANKR_API_KEY is required")
});
function getConfig() {
  return {
    ANKR_API_KEY: process.env.ANKR_API_KEY || ""
  };
}
async function validateAnkrConfig(runtime) {
  try {
    const envConfig = getConfig();
    const config = {
      ANKR_API_KEY: process.env.ANKR_API_KEY || runtime.getSetting("ANKR_API_KEY") || envConfig.ANKR_API_KEY
    };
    return ankrEnvSchema.parse(config);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to validate ANKR configuration: ${errorMessage}`);
  }
}

// src/actions/actionGetTokenHoldersCount.ts
import { z as z2 } from "zod";

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

// src/ankr/blockchains.ts
var Blockchains = /* @__PURE__ */ ((Blockchains2) => {
  Blockchains2["ARBITRUM"] = "arbitrum";
  Blockchains2["AVALANCHE"] = "avalanche";
  Blockchains2["BASE"] = "base";
  Blockchains2["BSC"] = "bsc";
  Blockchains2["ETH"] = "eth";
  Blockchains2["FANTOM"] = "fantom";
  Blockchains2["FLARE"] = "flare";
  Blockchains2["GNOSIS"] = "gnosis";
  Blockchains2["LINEA"] = "linea";
  Blockchains2["OPTIMISM"] = "optimism";
  Blockchains2["POLYGON"] = "polygon";
  Blockchains2["POLYGON_ZKEVM"] = "polygon_zkevm";
  Blockchains2["ROLLUX"] = "rollux";
  Blockchains2["SCROLL"] = "scroll";
  Blockchains2["SYSCOIN"] = "syscoin";
  Blockchains2["TELOS"] = "telos";
  Blockchains2["XAI"] = "xai";
  Blockchains2["XLAYER"] = "xlayer";
  Blockchains2["STORY_MAINNET"] = "story_mainnet";
  Blockchains2["AVALANCHE_FUJI"] = "avalanche_fuji";
  Blockchains2["BASE_SEPOLIA"] = "base_sepolia";
  Blockchains2["ETH_HOLESKY"] = "eth_holesky";
  Blockchains2["ETH_SEPOLIA"] = "eth_sepolia";
  Blockchains2["OPTIMISM_TESTNET"] = "optimism_testnet";
  Blockchains2["POLYGON_AMOY"] = "polygon_amoy";
  Blockchains2["STORY_TESTNET"] = "story_testnet";
  return Blockchains2;
})(Blockchains || {});
var blockchains = Object.values(Blockchains);
var blockchainInfoMap = {
  // Mainnets
  ["arbitrum" /* ARBITRUM */]: { tag: "arbitrum" /* ARBITRUM */, fullName: "Arbitrum" },
  ["avalanche" /* AVALANCHE */]: {
    tag: "avalanche" /* AVALANCHE */,
    fullName: "Avalanche"
  },
  ["base" /* BASE */]: { tag: "base" /* BASE */, fullName: "Base" },
  ["bsc" /* BSC */]: { tag: "bsc" /* BSC */, fullName: "Binance Smart Chain" },
  ["eth" /* ETH */]: { tag: "eth" /* ETH */, fullName: "Ethereum" },
  ["fantom" /* FANTOM */]: { tag: "fantom" /* FANTOM */, fullName: "Fantom" },
  ["flare" /* FLARE */]: { tag: "flare" /* FLARE */, fullName: "Flare" },
  ["gnosis" /* GNOSIS */]: { tag: "gnosis" /* GNOSIS */, fullName: "Gnosis" },
  ["linea" /* LINEA */]: { tag: "linea" /* LINEA */, fullName: "Linea" },
  ["optimism" /* OPTIMISM */]: { tag: "optimism" /* OPTIMISM */, fullName: "Optimism" },
  ["polygon" /* POLYGON */]: { tag: "polygon" /* POLYGON */, fullName: "Polygon" },
  ["polygon_zkevm" /* POLYGON_ZKEVM */]: {
    tag: "polygon_zkevm" /* POLYGON_ZKEVM */,
    fullName: "Polygon zkEVM"
  },
  ["rollux" /* ROLLUX */]: { tag: "rollux" /* ROLLUX */, fullName: "Rollux" },
  ["scroll" /* SCROLL */]: { tag: "scroll" /* SCROLL */, fullName: "Scroll" },
  ["syscoin" /* SYSCOIN */]: { tag: "syscoin" /* SYSCOIN */, fullName: "Syscoin" },
  ["telos" /* TELOS */]: { tag: "telos" /* TELOS */, fullName: "Telos" },
  ["xai" /* XAI */]: { tag: "xai" /* XAI */, fullName: "Xai" },
  ["xlayer" /* XLAYER */]: { tag: "xlayer" /* XLAYER */, fullName: "XLayer" },
  ["story_mainnet" /* STORY_MAINNET */]: {
    tag: "story_mainnet" /* STORY_MAINNET */,
    fullName: "Story"
  },
  // Testnets
  ["avalanche_fuji" /* AVALANCHE_FUJI */]: {
    tag: "avalanche_fuji" /* AVALANCHE_FUJI */,
    fullName: "Avalanche Fuji",
    isTestnet: true
  },
  ["base_sepolia" /* BASE_SEPOLIA */]: {
    tag: "base_sepolia" /* BASE_SEPOLIA */,
    fullName: "Base Sepolia",
    isTestnet: true
  },
  ["eth_holesky" /* ETH_HOLESKY */]: {
    tag: "eth_holesky" /* ETH_HOLESKY */,
    fullName: "Ethereum Holesky",
    isTestnet: true
  },
  ["eth_sepolia" /* ETH_SEPOLIA */]: {
    tag: "eth_sepolia" /* ETH_SEPOLIA */,
    fullName: "Ethereum Sepolia",
    isTestnet: true
  },
  ["optimism_testnet" /* OPTIMISM_TESTNET */]: {
    tag: "optimism_testnet" /* OPTIMISM_TESTNET */,
    fullName: "Optimism Testnet",
    isTestnet: true
  },
  ["polygon_amoy" /* POLYGON_AMOY */]: {
    tag: "polygon_amoy" /* POLYGON_AMOY */,
    fullName: "Polygon Amoy",
    isTestnet: true
  },
  ["story_testnet" /* STORY_TESTNET */]: {
    tag: "story_testnet" /* STORY_TESTNET */,
    fullName: "Story Testnet",
    isTestnet: true
  }
};

// src/ankr/handlerFactory.ts
import {
  composeContext,
  elizaLogger,
  generateObject,
  ModelClass
} from "@elizaos/core";
import { AnkrProvider } from "@ankr.com/ankr.js";
var createStandardTemplate = (schema) => {
  var _a2;
  const schemaDescription = schema.description || "";
  const shape = ((_a2 = schema._def) == null ? void 0 : _a2.shape) || {};
  const propertyDescriptions = Object.entries(shape || {}).map(([key, value]) => {
    const desc = (value == null ? void 0 : value.description) || "";
    return `- ${key}: ${desc}`;
  }).join("\n");
  const hasBlockchains = (shape == null ? void 0 : shape.blockchain) !== void 0;
  const blockchainsSection = hasBlockchains ? `
## Supported Blockchains

### Mainnets
${Object.values(
    blockchainInfoMap
  ).filter((info) => !info.isTestnet).map((info) => `- ${info.fullName} (${info.tag})`).join("\n")}

### Testnets
${Object.values(blockchainInfoMap).filter((info) => info.isTestnet).map((info) => `- ${info.fullName} (${info.tag})`).join("\n")}` : "";
  return `Respond with a JSON markdown block containing only the extracted values
- Skip any values that cannot be determined.
- If no specific blockchain is mentioned, assume the user wants to check all supported blockchains.
- When a blockchain is mentioned by its full name (e.g., "Ethereum"), use the corresponding tag (e.g., "eth").

${schemaDescription ? `## Schema Description

${schemaDescription}
` : ""}
${propertyDescriptions ? `## Properties

${propertyDescriptions}
` : ""}
${blockchainsSection}

## Recent Messages

<recentMessages>
{{recentMessages}}
</recentMessages>

Given the recent messages, extract the following information according to the schema.

Respond with a JSON markdown block containing only the extracted values.`;
};
function createAnkrHandler({
  methodName,
  requestValidator: validator,
  methodHandler: apiMethod,
  responseFormatter: formatter,
  requestSchema: schema
}) {
  return async (runtime, message, state, options = {}, callback) => {
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
        state = await runtime.composeState(message);
      } else {
        state = await runtime.updateRecentMessageState(state);
      }
      const template = createStandardTemplate(schema);
      const context = composeContext({
        state,
        template
      });
      elizaLogger.debug(`[${methodName}] composed context`, {
        context
      });
      const content = await generateObject({
        schema,
        context,
        modelClass: ModelClass.SMALL,
        runtime
      });
      const request = content.object;
      elizaLogger.info(`[${methodName}] extracted request parameters`, {
        request
      });
      if (!validator(request)) {
        throw new ValidationError("Invalid request");
      }
      elizaLogger.debug(`[${methodName}] API request parameters`, {
        params: request
      });
      try {
        const response = await apiMethod(provider, request);
        elizaLogger.debug(`[${methodName}] received response from Ankr API`, {
          data: response
        });
        const formattedResponse = formatter(request, response);
        callback == null ? void 0 : callback({
          text: formattedResponse,
          content: {
            success: true,
            request,
            response
          }
        });
        return true;
      } catch (error) {
        elizaLogger.error("API request failed", { error });
        throw new APIError(`Failed to fetch ${methodName} data`);
      }
    } catch (error) {
      elizaLogger.error("Handler execution failed", {
        error: error instanceof Error ? error.message : String(error)
      });
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      callback == null ? void 0 : callback({
        text: `Error in ${methodName}: ${errorMessage}`,
        content: {
          error
        }
      });
      if (error instanceof ConfigurationError || error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        `Failed to execute ${methodName} action: ${error}`,
        error
      );
    }
  };
}

// src/actions/actionGetTokenHoldersCount.ts
var getTokenHoldersCountRequestSchema = z2.object({
  blockchain: z2.nativeEnum(Blockchains).describe("The blockchain to get token holders count for"),
  contractAddress: z2.string().startsWith("0x").describe("The contract address of the token")
});
var validateGetTokenHoldersCountRequest = (content) => {
  const result = getTokenHoldersCountRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};
var formatGetTokenHoldersCountReply = (request, response) => {
  let formattedText = `Token Holders Count on ${request.blockchain.toUpperCase()}:

`;
  formattedText += `Current Holders: ${response.latestHoldersCount.toLocaleString()}

`;
  formattedText += "Historical Data:\n";
  response.holderCountHistory.forEach((history, index) => {
    const date = new Date(history.lastUpdatedAt).toLocaleDateString();
    formattedText += `
${index + 1}. ${date}
   Holders: ${history.holderCount.toLocaleString()}
   Total Amount: ${Number(history.totalAmount).toLocaleString()}`;
  });
  if (response.syncStatus) {
    formattedText += `

Sync Status: ${response.syncStatus.status} (${response.syncStatus.lag})`;
  }
  return formattedText;
};
var getTokenHoldersCountHandler = (provider, request) => {
  return provider.getTokenHoldersCount({
    blockchain: request.blockchain,
    contractAddress: request.contractAddress
  });
};
var actionGetTokenHoldersCount = {
  name: "GET_TOKEN_HOLDERS_COUNT_ANKR",
  similes: [
    "COUNT_HOLDERS",
    "TOTAL_HOLDERS",
    "HOLDERS_COUNT",
    "NUMBER_OF_HOLDERS"
  ],
  description: "Get the total number of holders and historical data for a specific token.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "How many holders does 0xdAC17F958D2ee523a2206206994597C13D831ec7 have on eth?"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetTokenHoldersCount",
    requestValidator: validateGetTokenHoldersCountRequest,
    requestSchema: getTokenHoldersCountRequestSchema,
    methodHandler: getTokenHoldersCountHandler,
    responseFormatter: formatGetTokenHoldersCountReply
  })
};

// src/actions/actionGetTokenPrice.ts
import { z as z3 } from "zod";
var getTokenPriceRequestSchema = z3.object({
  blockchain: z3.nativeEnum(Blockchains).describe("The blockchain to check the token price on"),
  contractAddress: z3.string().refine((val) => !val || val.startsWith("0x"), {
    message: "Contract address must either be empty or start with '0x'"
  }).optional().describe(
    "The contract address of the token to check the price of. Leave empty for native token."
  )
});
var validateGetTokenPriceRequest = (content) => {
  const result = getTokenPriceRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};
var formatGetTokenPriceReply = (request, response) => {
  const price = Number(response.usdPrice).toFixed(5);
  const contractDisplay = response.contractAddress ? `${response.contractAddress.slice(
    0,
    6
  )}...${response.contractAddress.slice(-4)}` : "Native Token";
  return `Current token price on ${request.blockchain}:

Price: $${price} USD
Contract: ${contractDisplay}
Sync Status: ${response.syncStatus.status} (lag: ${response.syncStatus.lag})`;
};
var getTokenPriceHandler = async (provider, request) => {
  return provider.getTokenPrice({
    blockchain: request.blockchain,
    contractAddress: request.contractAddress
  });
};
var actionGetTokenPrice = {
  name: "GET_TOKEN_PRICE_ANKR",
  similes: ["CHECK_PRICE", "TOKEN_PRICE", "CRYPTO_PRICE", "PRICE_CHECK"],
  description: "Get the current USD price for any token on supported blockchains.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "What's the current price of ETH?"
        }
      }
    ],
    [
      {
        user: "user",
        content: {
          text: "What's the current price of 0x8290333cef9e6d528dd5618fb97a76f268f3edd4 token on eth?"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetTokenPrice",
    requestValidator: validateGetTokenPriceRequest,
    requestSchema: getTokenPriceRequestSchema,
    methodHandler: getTokenPriceHandler,
    responseFormatter: formatGetTokenPriceReply
  })
};

// src/actions/actionGetTokenTransfers.ts
import { z as z4 } from "zod";
var getTokenTransfersRequestSchema = z4.object({
  blockchain: z4.nativeEnum(Blockchains).describe("The blockchain to get token transfers from"),
  address: z4.string().startsWith("0x").describe("The wallet address to get token transfers for"),
  contractAddress: z4.string().refine((val) => !val || val.startsWith("0x"), {
    message: "Contract address must be empty or start with 0x"
  }).optional().describe("The token contract address (optional)"),
  fromTimestamp: z4.number().optional().describe("Start timestamp for the transfers (optional)"),
  toTimestamp: z4.number().optional().describe("End timestamp for the transfers (optional)"),
  descOrder: z4.boolean().default(true).describe("Whether to sort transfers in descending order")
});
var validateGetTokenTransfersRequest = (content) => {
  const result = getTokenTransfersRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};
var formatGetTokenTransfersReply = (request, response) => {
  const { transfers, syncStatus } = response;
  let formattedText = `Token transfers for ${request.address} on ${request.blockchain}:

`;
  if (transfers.length === 0) {
    formattedText += "No token transfers found";
    return formattedText;
  }
  transfers.forEach((transfer, index) => {
    const date = new Date(transfer.timestamp * 1e3).toLocaleString();
    const value = Number(transfer.value);
    formattedText += `${index + 1}. ${transfer.tokenName} (${transfer.tokenSymbol})
`;
    if (transfer.fromAddress === request.address) {
      formattedText += `   Sent: ${value} ${transfer.tokenSymbol}
`;
      formattedText += `   To: ${transfer.toAddress.slice(
        0,
        6
      )}...${transfer.toAddress.slice(-4)}
`;
    } else {
      formattedText += `   Received: ${value} ${transfer.tokenSymbol}
`;
      formattedText += `   From: ${transfer.fromAddress.slice(
        0,
        6
      )}...${transfer.fromAddress.slice(-4)}
`;
    }
    formattedText += `   Contract: ${transfer.contractAddress.slice(
      0,
      6
    )}...${transfer.contractAddress.slice(-4)}
`;
    formattedText += `   Tx Hash: ${transfer.transactionHash.slice(
      0,
      6
    )}...${transfer.transactionHash.slice(-4)}
`;
    formattedText += `   Time: ${date}

`;
  });
  if (syncStatus) {
    formattedText += `Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})`;
  }
  return formattedText;
};
var getTokenTransfersHandler = async (provider, request) => {
  const params = {
    blockchain: request.blockchain,
    address: [request.address],
    descOrder: request.descOrder,
    pageSize: 10
  };
  if (request.fromTimestamp) {
    params.fromTimestamp = request.fromTimestamp;
  }
  if (request.toTimestamp) {
    params.toTimestamp = request.toTimestamp;
  }
  return provider.getTokenTransfers(params);
};
var actionGetTokenTransfers = {
  name: "GET_TOKEN_TRANSFERS_ANKR",
  similes: [
    "FETCH_TOKEN_TRANSFERS",
    "SHOW_TOKEN_TRANSFERS",
    "VIEW_TOKEN_TRANSFERS",
    "LIST_TOKEN_TRANSFERS"
  ],
  description: "Retrieve token transfer history for a specific address on the blockchain",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me token transfers for address 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 on eth"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetTokenTransfers",
    requestValidator: validateGetTokenTransfersRequest,
    requestSchema: getTokenTransfersRequestSchema,
    methodHandler: getTokenTransfersHandler,
    responseFormatter: formatGetTokenTransfersReply
  })
};

// src/actions/actionGetAccountBalance.ts
import { z as z5 } from "zod";
var getAccountBalanceRequestSchema = z5.object({
  blockchain: z5.union([z5.nativeEnum(Blockchains), z5.array(z5.nativeEnum(Blockchains))]).optional().describe("The blockchain(s) to check the balance on"),
  walletAddress: z5.string().startsWith("0x").describe(
    "The EVM-like wallet address to check the balance of, e.g. 0x1234567890123456789012345678901234567890"
  )
});
var validateGetAccountBalanceRequest = (content) => {
  const result = getAccountBalanceRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};
var formatGetAccountBalanceReply = (request, response) => {
  let formattedText = `Here are the balances for wallet ${request.walletAddress}:

`;
  if (response.assets.length === 0) {
    formattedText += "No balances found";
    return formattedText;
  }
  response.assets.forEach((balance, index) => {
    formattedText += `${index + 1}. ${balance.tokenName} (${balance.tokenType})
`;
    formattedText += `   Balance: ${balance.balance} ${balance.tokenSymbol}
`;
    if (balance.contractAddress) {
      formattedText += `   Contract: ${balance.contractAddress}
`;
    }
    formattedText += `   USD Value: $${Number.parseFloat(
      balance.balanceUsd
    ).toFixed(2)}

`;
  });
  return formattedText;
};
var getAccountBalanceHandler = (provider, request) => {
  return provider.getAccountBalance({
    blockchain: request.blockchain,
    walletAddress: request.walletAddress,
    onlyWhitelisted: true,
    pageSize: 50
  });
};
var actionGetAccountBalance = {
  name: "GET_ACCOUNT_BALANCE_ANKR",
  similes: [
    "CHECK_BALANCE",
    "SHOW_BALANCE",
    "VIEW_BALANCE",
    "GET_WALLET_BALANCE"
  ],
  description: "Retrieve account balance information across multiple blockchains.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me the balance for wallet 0x1234567890123456789012345678901234567890 on eth"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetAccountBalance",
    requestValidator: validateGetAccountBalanceRequest,
    requestSchema: getAccountBalanceRequestSchema,
    methodHandler: getAccountBalanceHandler,
    responseFormatter: formatGetAccountBalanceReply
  })
};

// src/actions/actionGetTransactionsByAddress.ts
import { z as z6 } from "zod";
var getTransactionsByAddressRequestSchema = z6.object({
  blockchain: z6.nativeEnum(Blockchains).describe("The blockchain to get transactions from"),
  address: z6.string().startsWith("0x").describe("The wallet address to get transactions for"),
  includeLogs: z6.boolean().default(true).describe("Whether to include transaction logs"),
  descOrder: z6.boolean().default(true).describe("Whether to sort transactions in descending order")
});
var validateGetTransactionsByAddressRequest = (content) => {
  const result = getTransactionsByAddressRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};
var formatGetTransactionsByAddressReply = (request, response) => {
  const { transactions, syncStatus } = response;
  let formattedText = `Transactions for ${request.address} on ${request.blockchain}:

`;
  if (transactions.length === 0) {
    formattedText += "No transactions found";
    return formattedText;
  }
  transactions.forEach((tx, index) => {
    const date = new Date(Number(tx.timestamp) * 1e3).toLocaleString();
    const value = Number(tx.value) / 1e18;
    const status = tx.status === "0x1" ? "Success" : "Failed";
    formattedText += `${index + 1}. Transaction
`;
    formattedText += `   Hash: ${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}
`;
    formattedText += `   From: ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}
`;
    if (tx.to) {
      formattedText += `   To: ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}
`;
    } else if (tx.contractAddress) {
      formattedText += `   Contract Created: ${tx.contractAddress.slice(
        0,
        6
      )}...${tx.contractAddress.slice(-4)}
`;
    }
    formattedText += `   Value: ${value.toFixed(4)} ${request.blockchain === "eth" ? "ETH" : "native tokens"}
`;
    formattedText += `   Status: ${status}
`;
    formattedText += `   Time: ${date}

`;
  });
  if (syncStatus) {
    formattedText += `Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})`;
  }
  return formattedText;
};
var getTransactionsByAddressHandler = async (provider, request) => {
  return provider.getTransactionsByAddress({
    blockchain: request.blockchain,
    address: [request.address],
    includeLogs: request.includeLogs,
    descOrder: request.descOrder,
    pageSize: 10
  });
};
var actionGetTransactionsByAddress = {
  name: "GET_TRANSACTIONS_BY_ADDRESS_ANKR",
  similes: ["LIST_TXS", "SHOW_TXS", "VIEW_TRANSACTIONS", "GET_ADDRESS_TXS"],
  description: "Get transactions for a specific address on the blockchain",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me the latest transactions for address 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 on eth"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetTransactionsByAddress",
    requestValidator: validateGetTransactionsByAddressRequest,
    requestSchema: getTransactionsByAddressRequestSchema,
    methodHandler: getTransactionsByAddressHandler,
    responseFormatter: formatGetTransactionsByAddressReply
  })
};

// src/actions/actionGetTransactionsByHash.ts
import { z as z7 } from "zod";
var getTransactionsByHashRequestSchema = z7.object({
  blockchain: z7.nativeEnum(Blockchains).optional().describe("The blockchain to get transaction from (optional)"),
  transactionHash: z7.string().startsWith("0x").describe("The transaction hash to look up"),
  includeLogs: z7.boolean().optional().default(false).describe("Whether to include transaction logs")
});
var validateGetTransactionsByHashRequest = (content) => {
  const result = getTransactionsByHashRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};
var formatGetTransactionsByHashReply = (request, response) => {
  const { transactions, syncStatus } = response;
  let formattedText = `Transaction details for hash ${request.transactionHash}:

`;
  if (transactions.length === 0) {
    formattedText += "No transaction found with this hash";
    return formattedText;
  }
  transactions.forEach((tx, index) => {
    formattedText += `Transaction #${index + 1}:
`;
    formattedText += `Blockchain: ${tx.blockchain || "Unknown"}
`;
    formattedText += `Hash: ${tx.hash || request.transactionHash}
`;
    formattedText += `Block: ${tx.blockNumber}
`;
    formattedText += `From: ${tx.from}
`;
    if (tx.to) {
      formattedText += `To: ${tx.to}
`;
    } else if (tx.contractAddress) {
      formattedText += `Contract Created: ${tx.contractAddress}
`;
    }
    formattedText += `Value: ${tx.value}
`;
    if (tx.gas) {
      formattedText += `Gas Limit: ${tx.gas}
`;
    }
    if (tx.gasUsed) {
      formattedText += `Gas Used: ${tx.gasUsed}
`;
    }
    if (tx.gasPrice) {
      formattedText += `Gas Price: ${tx.gasPrice}
`;
    }
    if (tx.status) {
      formattedText += `Status: ${tx.status === "1" ? "Success" : "Failed"}
`;
    }
    if (tx.timestamp) {
      const date = new Date(Number(tx.timestamp) * 1e3).toLocaleString();
      formattedText += `Time: ${date}
`;
    }
    if (request.includeLogs && tx.logs && tx.logs.length > 0) {
      formattedText += `
Logs (${tx.logs.length}):
`;
      tx.logs.forEach((log, logIndex) => {
        formattedText += `  Log #${logIndex + 1}:
`;
        formattedText += `    Address: ${log.address}
`;
        formattedText += `    Topics: ${log.topics.join(", ")}
`;
        if (log.event) {
          formattedText += `    Event: ${log.event.name}
`;
          if (log.event.inputs && log.event.inputs.length > 0) {
            formattedText += `    Inputs:
`;
            log.event.inputs.forEach((input) => {
              formattedText += `      ${input.name} (${input.type}): ${input.valueDecoded}
`;
            });
          }
        }
      });
    }
    formattedText += "\n";
  });
  if (syncStatus) {
    formattedText += `Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})
`;
    formattedText += `Last Update: ${new Date(
      syncStatus.timestamp * 1e3
    ).toLocaleString()}`;
  }
  return formattedText;
};
var getTransactionsByHashHandler = async (provider, request) => {
  return provider.getTransactionsByHash({
    transactionHash: request.transactionHash,
    ...request.blockchain && { blockchain: request.blockchain },
    includeLogs: request.includeLogs,
    decodeLogs: request.includeLogs,
    decodeTxData: true
  });
};
var actionGetTransactionsByHash = {
  name: "GET_TRANSACTIONS_BY_HASH_ANKR",
  similes: [
    "FETCH_TRANSACTION_BY_HASH",
    "SHOW_TRANSACTION_BY_HASH",
    "VIEW_TRANSACTION_BY_HASH",
    "GET_TX_BY_HASH"
  ],
  description: "Retrieve transaction details by transaction hash on specified blockchain networks.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me transaction 0x5a4bf6970980a9381e6d6c78d96ab278035bbff58c383ffe96a0a2bbc7c02a4c on eth"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetTransactionsByHash",
    requestValidator: validateGetTransactionsByHashRequest,
    requestSchema: getTransactionsByHashRequestSchema,
    methodHandler: getTransactionsByHashHandler,
    responseFormatter: formatGetTransactionsByHashReply
  })
};

// src/actions/actionGetBlockchainStats.ts
import { z as z8 } from "zod";
var getBlockchainStatsRequestSchema = z8.object({
  blockchain: z8.nativeEnum(Blockchains).describe("The blockchain to get statistics for")
});
var validateGetBlockchainStatsRequest = (content) => {
  const result = getBlockchainStatsRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};
var formatGetBlockchainStatsReply = (request, response) => {
  const stats = response.stats[0];
  const blockchainInfo = blockchainInfoMap[request.blockchain];
  const blockchainName = blockchainInfo ? blockchainInfo.fullName : request.blockchain;
  const formattedText = `Blockchain Statistics for ${blockchainName} (${request.blockchain}):

Latest Block: ${stats.latestBlockNumber.toLocaleString()}
Total Transactions: ${stats.totalTransactionsCount.toLocaleString()}
Total Events: ${stats.totalEventsCount.toLocaleString()}
Block Time: ${(stats.blockTimeMs / 1e3).toFixed(2)} seconds
Native Coin Price: $${Number.parseFloat(stats.nativeCoinUsdPrice).toFixed(
    2
  )} USD`;
  return formattedText;
};
var getBlockchainStatsHandler = async (provider, request) => {
  return provider.getBlockchainStats({
    blockchain: request.blockchain
  });
};
var actionGetBlockchainStats = {
  name: "GET_BLOCKCHAIN_STATS_ANKR",
  similes: [
    "BLOCKCHAIN_STATS",
    "CHAIN_STATS",
    "NETWORK_STATS",
    "BLOCKCHAIN_METRICS"
  ],
  description: "Retrieve statistics about a blockchain such as latest block, transaction count, and more.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me the stats for the Ethereum blockchain"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetBlockchainStats",
    requestValidator: validateGetBlockchainStatsRequest,
    requestSchema: getBlockchainStatsRequestSchema,
    methodHandler: getBlockchainStatsHandler,
    responseFormatter: formatGetBlockchainStatsReply
  })
};

// src/actions/actionGetCurrencies.ts
import { z as z9 } from "zod";
var getCurrenciesRequestSchema = z9.object({
  blockchain: z9.nativeEnum(Blockchains).describe("The blockchain to get currencies for")
});
var validateGetCurrenciesRequest = (content) => {
  const result = getCurrenciesRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};
var formatGetCurrenciesReply = (request, response) => {
  const { currencies, syncStatus } = response;
  let formattedText = `Here are the top currencies on ${request.blockchain}:

`;
  if (currencies.length === 0) {
    formattedText += "No currencies found";
    return formattedText;
  }
  currencies.forEach((currency, index) => {
    formattedText += `${index + 1}. ${currency.name} (${currency.symbol})
`;
    if (currency.address && currency.address !== "0x0000000000000000000000000000000000000000") {
      formattedText += `   Contract: ${currency.address.slice(
        0,
        6
      )}...${currency.address.slice(-4)}
`;
    } else {
      formattedText += `   Native Token
`;
    }
    formattedText += `   Decimals: ${currency.decimals}

`;
  });
  if (syncStatus) {
    formattedText += `Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})`;
  }
  return formattedText;
};
var getCurrenciesHandler = async (provider, request) => {
  return provider.getCurrencies({
    blockchain: request.blockchain
  });
};
var actionGetCurrencies = {
  name: "GET_CURRENCIES_ANKR",
  similes: [
    "LIST_CURRENCIES",
    "SHOW_CURRENCIES",
    "VIEW_CURRENCIES",
    "FETCH_CURRENCIES"
  ],
  description: "Retrieve information about currencies on specified blockchain networks.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me the top currencies on Ethereum"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetCurrencies",
    requestValidator: validateGetCurrenciesRequest,
    requestSchema: getCurrenciesRequestSchema,
    methodHandler: getCurrenciesHandler,
    responseFormatter: formatGetCurrenciesReply
  })
};

// src/actions/actionGetInteractions.ts
import { z as z10 } from "zod";
var getInteractionsRequestSchema = z10.object({
  address: z10.string().startsWith("0x").describe("The wallet address to get interactions for"),
  blockchain: z10.nativeEnum(Blockchains).optional().describe("The blockchain to check interactions on (optional)")
});
var validateGetInteractionsRequest = (content) => {
  const result = getInteractionsRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};
var formatGetInteractionsReply = (request, response) => {
  const { blockchains: blockchains4, syncStatus } = response;
  let formattedText = `Blockchain interactions for address ${request.address}:

`;
  if (blockchains4.length === 0) {
    formattedText += "No interactions found on any blockchain";
    return formattedText;
  }
  formattedText += `This address has interacted with the following blockchains:
`;
  blockchains4.forEach((chain, index) => {
    formattedText += `${index + 1}. ${chain}
`;
  });
  if (syncStatus) {
    formattedText += `
Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})`;
  }
  return formattedText;
};
var getInteractionsHandler = async (provider, request) => {
  return provider.getInteractions({
    address: request.address,
    // Only include blockchain if it's provided
    ...request.blockchain && { blockchain: request.blockchain }
  });
};
var actionGetInteractions = {
  name: "GET_INTERACTIONS_ANKR",
  similes: [
    "FETCH_INTERACTIONS",
    "SHOW_INTERACTIONS",
    "VIEW_INTERACTIONS",
    "LIST_INTERACTIONS"
  ],
  description: "Retrieve interactions between wallets and smart contracts on specified blockchain networks.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me interactions for the wallet 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetInteractions",
    requestValidator: validateGetInteractionsRequest,
    requestSchema: getInteractionsRequestSchema,
    methodHandler: getInteractionsHandler,
    responseFormatter: formatGetInteractionsReply
  })
};

// src/actions/actionGetNFTHolders.ts
import { z as z11 } from "zod";
var getNFTHoldersRequestSchema = z11.object({
  blockchain: z11.nativeEnum(Blockchains).default("eth" /* ETH */).describe("The blockchain to get NFT holders from"),
  contractAddress: z11.string().startsWith("0x").describe("The NFT contract address to get holders for")
});
var validateGetNFTHoldersRequest = (content) => {
  const result = getNFTHoldersRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};
var formatGetNFTHoldersReply = (request, response) => {
  const { holders, syncStatus } = response;
  let formattedText = `NFT Holders for contract ${request.contractAddress} on ${request.blockchain}:

`;
  if (holders.length === 0) {
    formattedText += "No holders found for this NFT contract";
    return formattedText;
  }
  formattedText += `Total Holders: ${holders.length}

`;
  holders.forEach((holderAddress, index) => {
    formattedText += `${index + 1}. ${holderAddress}
`;
  });
  if (syncStatus) {
    formattedText += `
Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})
`;
    formattedText += `Last Update: ${new Date(
      syncStatus.timestamp * 1e3
    ).toLocaleString()}`;
  }
  return formattedText;
};
var getNFTHoldersHandler = async (provider, request) => {
  return provider.getNFTHolders({
    blockchain: request.blockchain,
    contractAddress: request.contractAddress,
    pageSize: 10
  });
};
var actionGetNFTHolders = {
  name: "GET_NFT_HOLDERS_ANKR",
  similes: [
    "FETCH_NFT_HOLDERS",
    "SHOW_NFT_HOLDERS",
    "VIEW_NFT_HOLDERS",
    "LIST_NFT_HOLDERS"
  ],
  description: "Retrieve holders of specific NFTs on specified blockchain networks.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me holders of NFT contract 0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258 on bsc"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetNFTHolders",
    requestValidator: validateGetNFTHoldersRequest,
    requestSchema: getNFTHoldersRequestSchema,
    methodHandler: getNFTHoldersHandler,
    responseFormatter: formatGetNFTHoldersReply
  })
};

// src/actions/actionGetNFTTransfers.ts
import { z as z12 } from "zod";
var getNFTTransfersRequestSchema = z12.object({
  blockchain: z12.nativeEnum(Blockchains).describe("The blockchain to get NFT transfers from"),
  contractAddress: z12.string().refine((val) => !val || val.startsWith("0x"), {
    message: "Contract address must be empty or start with 0x"
  }).optional().describe("The NFT contract address (optional)"),
  fromAddress: z12.string().refine((val) => !val || val.startsWith("0x"), {
    message: "From address must be empty or start with 0x"
  }).optional().describe("The sender address (optional)"),
  toAddress: z12.string().refine((val) => !val || val.startsWith("0x"), {
    message: "To address must be empty or start with 0x"
  }).optional().describe("The recipient address (optional)"),
  fromTimestamp: z12.number().optional().describe("Start timestamp for the transfers (optional)"),
  toTimestamp: z12.number().optional().describe("End timestamp for the transfers (optional)")
});
var validateGetNFTTransfersRequest = (content) => {
  const result = getNFTTransfersRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  const typedContent = content;
  if (!typedContent.contractAddress && !typedContent.fromAddress && !typedContent.toAddress) {
    throw new ValidationError(
      "At least one of contractAddress, fromAddress, or toAddress must be provided"
    );
  }
  return true;
};
var formatGetNFTTransfersReply = (request, response) => {
  const { transfers, syncStatus } = response;
  let formattedText = `NFT Transfers on ${request.blockchain}:

`;
  if (request.contractAddress) {
    formattedText += `Contract: ${request.contractAddress}

`;
  }
  if (request.fromAddress) {
    formattedText += `From Address: ${request.fromAddress}

`;
  }
  if (request.toAddress) {
    formattedText += `To Address: ${request.toAddress}

`;
  }
  if (transfers.length === 0) {
    formattedText += "No NFT transfers found";
    return formattedText;
  }
  transfers.forEach((transfer, index) => {
    const date = new Date(transfer.timestamp * 1e3).toLocaleString();
    formattedText += `${index + 1}. ${transfer.collectionName || "NFT"} (ID: ${transfer.tokenId || "Unknown"})
`;
    formattedText += `   From: ${transfer.fromAddress.slice(
      0,
      6
    )}...${transfer.fromAddress.slice(-4)}
`;
    formattedText += `   To: ${transfer.toAddress.slice(
      0,
      6
    )}...${transfer.toAddress.slice(-4)}
`;
    formattedText += `   Contract: ${transfer.contractAddress.slice(
      0,
      6
    )}...${transfer.contractAddress.slice(-4)}
`;
    formattedText += `   Type: ${transfer.type}
`;
    formattedText += `   Tx Hash: ${transfer.transactionHash.slice(
      0,
      6
    )}...${transfer.transactionHash.slice(-4)}
`;
    formattedText += `   Time: ${date}

`;
  });
  if (syncStatus) {
    formattedText += `Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})
`;
    formattedText += `Last Update: ${new Date(
      syncStatus.timestamp * 1e3
    ).toLocaleString()}`;
  }
  return formattedText;
};
var getNFTTransfersHandler = async (provider, request) => {
  const params = {
    blockchain: request.blockchain,
    pageSize: 10
  };
  if (request.contractAddress) {
    params.contractAddress = request.contractAddress;
  }
  if (request.fromAddress) {
    params.fromAddress = request.fromAddress;
  }
  if (request.toAddress) {
    params.toAddress = request.toAddress;
  }
  if (request.fromTimestamp) {
    params.fromTimestamp = request.fromTimestamp;
  }
  if (request.toTimestamp) {
    params.toTimestamp = request.toTimestamp;
  }
  return provider.getNftTransfers(params);
};
var actionGetNFTTransfers = {
  name: "GET_NFT_TRANSFERS_ANKR",
  similes: [
    "FETCH_NFT_TRANSFERS",
    "SHOW_NFT_TRANSFERS",
    "VIEW_NFT_TRANSFERS",
    "LIST_NFT_TRANSFERS"
  ],
  description: "Retrieve NFT transfer history on specified blockchain networks.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me NFT transfers for contract 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d on eth"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetNFTTransfers",
    requestValidator: validateGetNFTTransfersRequest,
    requestSchema: getNFTTransfersRequestSchema,
    methodHandler: getNFTTransfersHandler,
    responseFormatter: formatGetNFTTransfersReply
  })
};

// src/actions/actionGetNFTMetadata.ts
import { z as z13 } from "zod";
var getNFTMetadataRequestSchema = z13.object({
  blockchain: z13.nativeEnum(Blockchains).describe("The blockchain to get NFT metadata from"),
  contractAddress: z13.string().startsWith("0x").describe("The NFT contract address"),
  tokenId: z13.string().describe("The token ID of the NFT")
});
var validateGetNFTMetadataRequest = (content) => {
  const result = getNFTMetadataRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};
var formatGetNFTMetadataReply = (request, response) => {
  const { metadata, attributes, syncStatus } = response;
  if (!metadata || !attributes) {
    return `No metadata found for NFT with token ID ${request.tokenId} at contract ${request.contractAddress} on ${request.blockchain}`;
  }
  let formattedText = `NFT Metadata for ${attributes.name || `Token #${request.tokenId}`}:

`;
  const collectionName = attributes.name ? attributes.name.split("#")[0].trim() : metadata.collectionName || "Unknown Collection";
  formattedText += `Collection: ${collectionName}
`;
  formattedText += `Contract: ${metadata.contractAddress.slice(
    0,
    6
  )}...${metadata.contractAddress.slice(-4)} (${metadata.contractType})

`;
  if (attributes.description) {
    formattedText += `Description: ${attributes.description}

`;
  }
  if (attributes.traits && attributes.traits.length > 0) {
    formattedText += "Traits:\n";
    for (const trait of attributes.traits) {
      formattedText += `- ${trait.trait_type}: ${trait.value}
`;
    }
  }
  if (attributes.imageUrl) {
    formattedText += `
Image URL: ${attributes.imageUrl}
`;
  }
  if (attributes.tokenUrl) {
    formattedText += `Token URL: ${attributes.tokenUrl}
`;
  }
  if (syncStatus) {
    formattedText += `
Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})
`;
    formattedText += `Last Update: ${new Date(
      syncStatus.timestamp * 1e3
    ).toLocaleString()}`;
  }
  return formattedText;
};
var getNFTMetadataHandler = async (provider, request) => {
  return provider.getNFTMetadata({
    blockchain: request.blockchain,
    contractAddress: request.contractAddress,
    tokenId: request.tokenId,
    forceFetch: true
  });
};
var actionGetNFTMetadata = {
  name: "GET_NFT_METADATA_ANKR",
  similes: ["GET_NFT_INFO", "SHOW_NFT_DETAILS", "VIEW_NFT", "NFT_METADATA"],
  description: "Get detailed metadata for a specific NFT including traits, images, and contract information.",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me the metadata for NFT token 1234 at contract 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d on eth"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetNFTMetadata",
    requestValidator: validateGetNFTMetadataRequest,
    requestSchema: getNFTMetadataRequestSchema,
    methodHandler: getNFTMetadataHandler,
    responseFormatter: formatGetNFTMetadataReply
  })
};

// src/actions/actionGetNFTsByOwner.ts
import { z as z14 } from "zod";
var getNFTsByOwnerRequestSchema = z14.object({
  blockchain: z14.union([z14.nativeEnum(Blockchains), z14.array(z14.nativeEnum(Blockchains))]).optional().describe("The blockchain(s) to get NFTs from"),
  walletAddress: z14.string().startsWith("0x").describe("The wallet address to get NFTs for")
});
var validateGetNFTsByOwnerRequest = (content) => {
  const result = getNFTsByOwnerRequestSchema.safeParse(content);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.success;
};
var formatGetNFTsByOwnerReply = (request, response) => {
  const { assets, syncStatus } = response;
  let formattedText = `NFTs owned by ${request.walletAddress}:

`;
  if (assets.length === 0) {
    formattedText += "No NFTs found";
    return formattedText;
  }
  assets.forEach((nft, index) => {
    formattedText += `${index + 1}. ${nft.name || "Unnamed NFT"}
`;
    formattedText += `   Collection: ${nft.collectionName || "Unknown Collection"}
`;
    formattedText += `   Token ID: ${nft.tokenId}
`;
    formattedText += `   Blockchain: ${nft.blockchain}
`;
    formattedText += `   Contract: ${nft.contractAddress.slice(
      0,
      6
    )}...${nft.contractAddress.slice(-4)}
`;
    if (nft.quantity && nft.quantity !== "1") {
      formattedText += `   Quantity: ${nft.quantity}
`;
    }
    formattedText += `   Type: ${nft.contractType}

`;
  });
  if (syncStatus) {
    formattedText += `Sync Status: ${syncStatus.status} (lag: ${syncStatus.lag})`;
  }
  return formattedText;
};
var getNFTsByOwnerHandler = async (provider, request) => {
  return provider.getNFTsByOwner({
    blockchain: request.blockchain,
    walletAddress: request.walletAddress,
    pageSize: 10
  });
};
var actionGetNFTsByOwner = {
  name: "GET_NFTS_BY_OWNER_ANKR",
  similes: [
    "LIST_NFTS",
    "SHOW_NFTS",
    "VIEW_NFTS",
    "FETCH_NFTS",
    "GET_OWNED_NFTS"
  ],
  description: "Get NFTs owned by a specific wallet address across multiple blockchains",
  examples: [
    [
      {
        user: "user",
        content: {
          text: "Show me the NFTs owned by 0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
        }
      }
    ]
  ],
  validate: async (_runtime, message) => {
    return true;
  },
  handler: createAnkrHandler({
    methodName: "GetNFTsByOwner",
    requestValidator: validateGetNFTsByOwnerRequest,
    requestSchema: getNFTsByOwnerRequestSchema,
    methodHandler: getNFTsByOwnerHandler,
    responseFormatter: formatGetNFTsByOwnerReply
  })
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
var ANKR_SPASH = getConfig().ANKR_API_KEY;
var _a, _b;
if (ANKR_SPASH) {
  console.log(`
${chalk.cyan("\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510")}`);
  console.log(
    chalk.cyan("\u2502") + chalk.yellow.bold("          ANKR PLUGIN             ") + chalk.cyan(" \u2502")
  );
  console.log(chalk.cyan("\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524"));
  console.log(
    chalk.cyan("\u2502") + chalk.white("  Initializing ANKR Services...    ") + chalk.cyan("\u2502")
  );
  console.log(
    chalk.cyan("\u2502") + chalk.white("  Version: 0.2.0                        ") + chalk.cyan("\u2502")
  );
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
      ((_a = action.examples) == null ? void 0 : _a.length) > 0 ? chalk.green("\u2713") : chalk.red("\u2717"),
      chalk.gray(((_b = action.similes) == null ? void 0 : _b.join(", ")) || "none")
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