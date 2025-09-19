import { useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { config } from '../../../config';

interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

const ZEPHYR_CONFIG: NetworkConfig = {
  chainId: '0x5477e7e', // 1417429182 in hex
  chainName: 'Zephyr Test Net',
  nativeCurrency: {
    name: 'ZERO',
    symbol: 'Z',
    decimals: 18,
  },
  // TODO: add to env vars
  rpcUrls: ['https://zephyr-rpc.eu-north-2.gateway.fm/'],
  blockExplorerUrls: ['https://zephyr-blockscout.eu-north-2.gateway.fm/'],
};

const ZCHAIN_CONFIG: NetworkConfig = {
  chainId: '0x2499', // 9369 in hex
  chainName: 'zChain Mainnet',
  nativeCurrency: {
    name: 'ZEPHYR',
    symbol: 'ZEPHYR',
    decimals: 18,
  },
  // TODO: add to env vars
  rpcUrls: ['https://z-chain-rpc.eu-north-2.gateway.fm/'],
  blockExplorerUrls: ['https://explorer.zchain.network/'],
};

export const useNetworkSwitching = () => {
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const getTargetNetwork = (): NetworkConfig => {
    // Use Zephyr for dev, zChain for production
    const isDev = process.env.NODE_ENV === 'development' || Number(config.zChainId) === 1417429182;
    return isDev ? ZEPHYR_CONFIG : ZCHAIN_CONFIG;
  };

  const switchToTargetNetwork = async (): Promise<boolean> => {
    const targetNetwork = getTargetNetwork();
    const targetChainId = parseInt(targetNetwork.chainId, 16);

    // If already on target network, return success
    if (chainId === targetChainId) {
      return true;
    }

    setIsSwitching(true);
    setError(null);

    try {
      await switchChain({ chainId: targetChainId });
      setIsSwitching(false);
      return true;
    } catch (error: any) {
      setError(`Failed to switch to ${targetNetwork.chainName}: ${error.message}`);
      setIsSwitching(false);
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const getNetworkName = () => {
    const targetNetwork = getTargetNetwork();
    return targetNetwork.chainName;
  };

  return {
    switchToTargetNetwork,
    isSwitching,
    error,
    clearError,
    getNetworkName,
  };
};
