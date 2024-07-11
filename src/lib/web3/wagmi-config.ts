import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Config } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { config } from '../../config';

export const wagmiConfig = getDefaultConfig({
  appName: 'zOS',
  projectId: config.WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet],
});

export const getWagmiConfig = (): Config => {
  return wagmiConfig;
};
