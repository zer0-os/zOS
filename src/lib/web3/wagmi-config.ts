import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Config, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { config } from '../../config';

let projectId: string = process.env.NODE_ENV === 'test' ? 'mock-project-id' : config.WALLET_CONNECT_PROJECT_ID;

let network: typeof mainnet | typeof sepolia;
const chainIdAsNumber = Number(config.supportedChainId);

if (chainIdAsNumber === 1) {
  network = mainnet;
} else if (chainIdAsNumber === 11155111) {
  network = sepolia;
} else {
  throw new Error('Unsupported chain ID');
}

export const wagmiConfig = getDefaultConfig({
  appName: 'zOS',
  projectId,
  chains: [network],
  transports: {
    [network.id]: http(config.INFURA_URL),
  },
});

export const getWagmiConfig = (): Config => {
  return wagmiConfig;
};
