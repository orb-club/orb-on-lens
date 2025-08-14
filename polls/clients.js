const { createPublicClient, http, defineChain } = require("viem");

const viem_chains = require("viem/chains");

require("dotenv").config({ path: __dirname + "/.env" });

if (!process.env.ALCHEMY_API_KEY) {
  throw new Error("ALCHEMY_API_KEY is not set in .env");
}

const lens = defineChain({
  id: 232,
  name: "lens",
  nativeCurrency: {
    decimals: 18,
    name: "GHO",
    symbol: "GHO",
  },
  rpcUrls: {
    default: {
      http: ["https://api.lens.matterhosted.dev"],
      webSocket: ["https://api.lens.matterhosted.dev/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://explorer.testnet.lens.xyz/",
    },
  },
});

const lensTestnet = defineChain({
  id: 37111,
  name: "lens testnet",
  nativeCurrency: {
    decimals: 18,
    name: "GRASS",
    symbol: "GRASS",
  },
  rpcUrls: {
    default: {
      http: [
        `https://lens-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      ],
      webSocket: [
        `wss://lens-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://explorer.testnet.lens.xyz/",
    },
  },
});

const CHAINS = {
  324: viem_chains.zksync,
  8453: viem_chains.base,
  137: viem_chains.polygon,
  1: viem_chains.mainnet,
  10: viem_chains.optimism,
  42161: viem_chains.arbitrum,
  7777777: viem_chains.zora,

  300: viem_chains.zksyncSepoliaTestnet,
  84532: viem_chains.baseSepolia,
  80002: viem_chains.polygonAmoy,
  232: lens,
  37111: lensTestnet,
};

const RPC_URLS = {
  324: `https://zksync-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  8453: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  137: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  1: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  10: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  42161: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  7777777: `https://zora-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  //232: chains.mainnet,

  300: `https://zksync-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  84532: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  80002: `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  232: `https://lens-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  37111: `https://lens-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
};

function getPublicClient(chain) {
  if (!chain) {
    chain = process.env.ORB_ENV === "TESTNET" ? lensTestnet : lens;
  } else {
    chain = CHAINS[chain];
  }

  const rpcUrl = RPC_URLS[chain.id];
  const publicClient = createPublicClient({
    chain: chain,
    transport: http(rpcUrl),
  });
  return publicClient;
}

module.exports = {
  getPublicClient,
};
