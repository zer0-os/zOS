import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Config } from 'wagmi';
import { mainnet } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'zOS',
  projectId: 'TEMP_ID',
  chains: [mainnet],
});

export const getWagmiConfig = (): Config => {
  return wagmiConfig;
};
