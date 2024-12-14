import '@rainbow-me/rainbowkit/styles.css';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { getWagmiConfig } from '../wagmi-config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider as RKProvider, darkTheme } from '@rainbow-me/rainbowkit';

export const queryClient = new QueryClient();

export interface RainbowKitProviderProps {
  children: ReactNode;
}

export const RainbowKitProvider = ({ children }) => {
  return (
    <WagmiProvider config={getWagmiConfig()}>
      <QueryClientProvider client={queryClient}>
        <RKProvider theme={darkTheme()} modalSize='compact'>
          {children}
        </RKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
