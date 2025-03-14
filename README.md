## Ankr Plugin for ElizaOS

![alt text](src/assets/ankr.jpg)

<div align="center">
  <h3>🔗 Blockchain Data Query Interface</h3>
</div>

### Getting Started

To use the Ankr plugin, you need an API key:

```bash
ANKR_API_KEY=your_ankr_api_key
```

You can get a free API key by signing up at [Ankr RPC Service](https://www.ankr.com/rpc/).

For the most up-to-date information about supported chains and features, please refer to the [Ankr Advanced API documentation](https://www.ankr.com/docs/advanced-api/overview/).

### Available Actions

The Ankr plugin provides comprehensive blockchain data querying capabilities through natural language prompts. Below are the supported actions and their usage:

#### 1. Blockchain Information

```yaml
# Get blockchain stats
Show me stats for eth
# or use the full name
Show me stats for Ethereum

# Get top currencies
Show me the top currencies on eth
# or use the full name
Show me the top currencies on Binance Smart Chain
```

#### 2. Wallet & Balance Queries

```yaml
# Check wallet balance
Show me the balance for wallet 0x6B0031518934952C485d5a7E76f1729B50e67486 on eth
# or use the full name
Show me the balance for wallet 0x6B0031518934952C485d5a7E76f1729B50e67486 on Ethereum

# View wallet interactions
Show me interactions for the wallet 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45
```

#### 3. NFT Operations

```yaml
# Get NFT holders
Show me holders of NFT contract 0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258 token 112234 on eth

# Get NFT metadata
Show me the metadata for NFT 1234 at contract 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d eth

# List NFTs by owner
Show me all NFTs owned by wallet 0x1234567890123456789012345678901234567890 on eth

# View NFT transfers
Show me NFT transfers for contract 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 eth
```

#### 4. Token Operations

```yaml
# Get token holders
Show me holders for contract 0xf307910A4c7bbc79691fD374889b36d8531B08e3 on bsc

# Get token holder count
How many holders does 0xdAC17F958D2ee523a2206206994597C13D831ec7 have on eth?

# Check token price
What's the current price of 0x8290333cef9e6d528dd5618fb97a76f268f3edd4 token eth

# View token transfers
Show me recent contract 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 transfers eth from 1655197483 to 1656061483
```

#### 5. Transaction Queries

```yaml
# Get transactions by address
Show me the latest transactions for address 0xd8da6bf26964af9d7eed9e03e53415d37aa96045 eth

# Get transaction details
Show me details for transaction 0x748eeb4a15ba05736a9397a07ca86f0184c0c1eca53fa901b28a412d1a3f211f eth
```

### Supported Blockchains

The plugin supports multiple blockchains including:

#### Mainnets

- Arbitrum (arbitrum)
- Avalanche (avalanche)
- Base (base)
- Binance Smart Chain (bsc)
- Ethereum (eth)
- Fantom (fantom)
- Flare (flare)
- Gnosis (gnosis)
- Linea (linea)
- Optimism (optimism)
- Polygon (polygon)
- Polygon zkEVM (polygon_zkevm)
- Rollux (rollux)
- Scroll (scroll)
- Story (story_mainnet)
- Syscoin (syscoin)
- Telos (telos)
- Xai (xai)
- XLayer (xlayer)

#### Testnets

- Avalanche Fuji (avalanche_fuji)
- Base Sepolia (base_sepolia)
- Ethereum Holesky (eth_holesky)
- Ethereum Sepolia (eth_sepolia)
- Optimism Testnet (optimism_testnet)
- Polygon Amoy (polygon_amoy)
- Story Testnet (story_testnet)
