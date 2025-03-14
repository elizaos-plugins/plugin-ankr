import {
  AgentRuntime,
  Character,
  Content,
  Memory,
  ModelProviderName,
} from "@elizaos/core";

import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";
import actionGetAccountBalance from "../actions/actionGetAccountBalance";
import actionGetBlockchainStats from "../actions/actionGetBlockchainStats";
import actionGetCurrencies from "../actions/actionGetCurrencies";
import actionGetInteractions from "../actions/actionGetInteractions";
import actionGetNFTHolders from "../actions/actionGetNFTHolders";
import actionGetNFTMetadata from "../actions/actionGetNFTMetadata";
import actionGetNFTsByOwner from "../actions/actionGetNFTsByOwner";
import actionGetNFTTransfers from "../actions/actionGetNFTTransfers";
import actionGetTokenHolders from "../actions/actionGetTokenHolders";
import actionGetTokenHoldersCount from "../actions/actionGetTokenHoldersCount";
import actionGetTokenPrice from "../actions/actionGetTokenPrice";
import actionGetTokenTransfers from "../actions/actionGetTokenTransfers";
import actionGetTransactionsByAddress from "../actions/actionGetTransactionsByAddress";
import actionGetTransactionsByHash from "../actions/actionGetTransactionsByHash";
import { createMockDatabaseAdapter } from "./mockDatabaseAdapter";

const modelProvider = ModelProviderName.GOOGLE;
const token = process.env.GOOGLE_API_KEY;

// Verify required environment variables are set
if (!token) {
  throw new Error("GOOGLE_API_KEY is not set, it is required for e2e testing");
}

const ankrApiKey = process.env.ANKR_API_KEY;
if (!ankrApiKey) {
  throw new Error("ANKR_API_KEY is not set, it is required for e2e testing");
}

const character: Character = {
  name: "Eliza",
  username: "eliza",
  plugins: [],
  modelProvider: modelProvider,
  settings: {
    secrets: {
      ANKR_API_KEY: ankrApiKey,
    },
    voice: {},
  },
  system: "",
  bio: [],
  lore: [],
  messageExamples: [],
  postExamples: [],
  topics: [],
  style: {
    all: [],
    chat: [],
    post: [],
  },
  adjectives: [],
  extends: [],
};

// Helper function to create a runtime with a message
const createRuntimeWithMessage = (messageText: string) => {
  const message = {
    content: {
      text: messageText,
    },
    userId: randomUUID(),
    agentId: randomUUID(),
    roomId: randomUUID(),
  };

  const runtime = new AgentRuntime({
    token,
    modelProvider,
    character,
    databaseAdapter: createMockDatabaseAdapter({
      recentMessages: [message],
    }),
  });

  return { runtime, message };
};

describe("Ankr API E2E Tests", () => {
  describe("GetAccountBalance", () => {
    it("gets account balance for a wallet", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "Get the balance of wallet 0x1234567890123456789012345678901234567890 on eth"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetAccountBalance.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain(
        "Here are the balances for wallet"
      );
      expect(receivedResponse.text).toContain(
        "0x1234567890123456789012345678901234567890"
      );
    });
  }, 30000);

  describe("GetBlockchainStats", () => {
    it("gets blockchain stats for Ethereum", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "Show me the stats for the Ethereum blockchain"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetBlockchainStats.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain("Blockchain Statistics for");
      expect(receivedResponse.text).toContain("Latest Block");
      expect(receivedResponse.text).toContain("Total Transactions");
    });
  }, 30000);

  describe("GetTokenPrice", () => {
    it("gets price for ETH", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "What's the current price of ETH?"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetTokenPrice.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain("Current token price on");
      expect(receivedResponse.text).toContain("Price: $");
    });
  }, 30000);

  describe("GetCurrencies", () => {
    it("gets currencies for Ethereum", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "Show me the top currencies on Ethereum"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetCurrencies.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain("Here are the top currencies on");
      expect(receivedResponse.text).toContain("Decimals:");
      // We're not testing for specific number of results since we're using a fixed pageSize
    });
  }, 30000);

  describe("GetTransactionsByAddress", () => {
    it("gets transactions for a wallet address", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "Show me the latest transactions for address 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 on eth"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetTransactionsByAddress.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain("Transactions for");
      expect(receivedResponse.text).toContain(
        "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
      );
      expect(receivedResponse.text).toContain("Hash:");
      // We're not testing for specific number of results since we're using a fixed pageSize
    });
  }, 30000);

  describe("GetNFTsByOwner", () => {
    it("gets NFTs for a wallet address", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "Show me the NFTs owned by 0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetNFTsByOwner.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain("NFTs owned by");
      expect(receivedResponse.text).toContain(
        "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
      );
      // We're not testing for specific number of results since we're using a fixed pageSize
    });
  }, 30000);

  describe("GetInteractions", () => {
    it("gets blockchain interactions for a wallet address", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "Show me interactions for the wallet 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetInteractions.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain(
        "Blockchain interactions for address"
      );
      expect(receivedResponse.text).toContain(
        "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
      );
    });
  }, 30000);

  describe("GetTokenTransfers", () => {
    it("gets token transfers for a wallet address", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "Show me token transfers for address 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 on eth"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetTokenTransfers.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain("Token transfers for");
      expect(receivedResponse.text).toContain(
        "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
      );
      // We're not testing for specific number of results since we're using a fixed pageSize
    });
  }, 30000);

  describe("GetNFTHolders", () => {
    it("gets holders of an NFT contract", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "Show me holders of NFT contract 0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258 on bsc"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetNFTHolders.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain("NFT Holders for contract");
      expect(receivedResponse.text).toContain(
        "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258"
      );
      // We're not testing for specific number of results since we're using a fixed pageSize
    });
  }, 30000);

  describe("GetTransactionsByHash", () => {
    it("gets transaction details by hash", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "Show me transaction 0x5a4bf6970980a9381e6d6c78d96ab278035bbff58c383ffe96a0a2bbc7c02a4c on eth"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetTransactionsByHash.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain("Transaction details for hash");
      expect(receivedResponse.text).toContain(
        "0x5a4bf6970980a9381e6d6c78d96ab278035bbff58c383ffe96a0a2bbc7c02a4c"
      );
    });
  }, 30000);

  describe("GetNFTMetadata", () => {
    it("gets metadata for an NFT", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "Show me the metadata for NFT token 1234 at contract 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d on eth"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetNFTMetadata.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain("NFT Metadata for");
      expect(receivedResponse.text).toContain("Collection:");
      expect(receivedResponse.text).toContain("Contract:");
    });
  }, 30000);

  describe("GetNFTTransfers", () => {
    it("gets NFT transfers for a contract", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "Show me NFT transfers for contract 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d on eth"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetNFTTransfers.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain("NFT Transfers on eth");
      expect(receivedResponse.text).toContain(
        "Contract: 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
      );
      // We're not testing for specific number of results since we're using a fixed pageSize
    });
  }, 30000);

  describe("GetTokenHolders", () => {
    it("gets token holders for a contract", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "Show me holders for contract 0xf307910A4c7bbc79691fD374889b36d8531B08e3 on bsc"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetTokenHolders.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain("Token Holders on BSC");
      expect(receivedResponse.text).toContain("Total Holders:");
      expect(receivedResponse.text).toContain("Balance:");
    });
  }, 30000);

  describe("GetTokenHoldersCount", () => {
    it("gets token holders count for a contract", async () => {
      const { runtime, message } = createRuntimeWithMessage(
        "How many holders does 0xdAC17F958D2ee523a2206206994597C13D831ec7 have on eth?"
      );

      let receivedResponse: Content;
      const callback = (response: Content): Promise<Memory[]> => {
        receivedResponse = response;
        return Promise.resolve([]);
      };

      const success = await actionGetTokenHoldersCount.handler(
        runtime,
        message,
        undefined,
        undefined,
        callback
      );

      expect(success).toBe(true);
      expect(receivedResponse.text).toContain("Token Holders Count on ETH");
      expect(receivedResponse.text).toContain("Current Holders:");
      expect(receivedResponse.text).toContain("Historical Data:");
    });
  }, 30000);
});
