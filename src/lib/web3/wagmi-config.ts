import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'zOS',
  projectId: 'TEMP_ID',
  chains: [mainnet],
});

export const getWagmiConfig = () => {
  return wagmiConfig;
};
