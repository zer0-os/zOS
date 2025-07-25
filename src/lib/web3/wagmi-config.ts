import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Config, http } from 'wagmi';
import { mainnet, sepolia, avalancheFuji } from 'wagmi/chains';
import { Chain } from 'viem';
import { config } from '../../config';

// Define Zephyr Test Net custom chain
const zephyrTestNet: Chain = {
  id: 1417429182,
  name: 'Zephyr Test Net',
  nativeCurrency: {
    decimals: 18,
    name: 'ZERO',
    symbol: 'Z',
  },
  rpcUrls: {
    default: {
      http: ['https://zephyr-rpc.eu-north-2.gateway.fm/'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://zephyr-blockscout.eu-north-2.gateway.fm/' },
  },
  testnet: true,
};

let projectId: string = process.env.NODE_ENV === 'test' ? 'mock-project-id' : config.WALLET_CONNECT_PROJECT_ID;

let network: typeof mainnet | typeof sepolia | typeof avalancheFuji;
const chainIdAsNumber = Number(config.supportedChainId);

if (chainIdAsNumber === 1) {
  network = mainnet;
} else if (chainIdAsNumber === 11155111) {
  network = sepolia;
} else if (chainIdAsNumber === 43113) {
  network = avalancheFuji;
} else {
  throw new Error('Unsupported chain ID');
}

// Get the appropriate RPC URL for the network
const getRpcUrl = () => {
  // Use the network-specific RPC URL from config, with fallback to public RPC
  const rpcUrl = config.INFURA_URLS[network.id as keyof typeof config.INFURA_URLS];

  if (rpcUrl) {
    return rpcUrl;
  }

  // Fallback to public RPC endpoints
  if (network.id === 43113) {
    return 'https://api.avax-test.network/ext/bc/C/rpc';
  }

  return config.INFURA_URL;
};

export const wagmiConfig = getDefaultConfig({
  appName: 'zOS',
  projectId,
  chains: [network, ...(network.id !== 43113 ? [avalancheFuji] : []), zephyrTestNet], // Always include Fuji and Zephyr for staking
  transports: {
    [network.id]: http(getRpcUrl()),
    ...(network.id !== 43113
      ? { 43113: http(config.INFURA_URLS[43113] || 'https://api.avax-test.network/ext/bc/C/rpc') }
      : {}),
    [zephyrTestNet.id]: http('https://zephyr-rpc.eu-north-2.gateway.fm/'),
  },
});

export const getWagmiConfig = (): Config => {
  return wagmiConfig;
};
