import { useState, useCallback } from 'react';
import { createPublicClient, http, parseAbi } from 'viem';
import { mainnet, polygon, avalanche, arbitrum, optimism } from 'wagmi/chains';
import { config } from '../../../../../config';

const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
]);

const SUPPORTED_CHAINS = [
  mainnet,
  polygon,
  avalanche,
  arbitrum,
  optimism,
];

export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  chainId: number;
  network: string;
  logo: string | null;
}

const ZERO_LOGO = '../../../../zero-pro-symbol.svg?react';

export function useTokenFinder() {
  const [token, setToken] = useState<TokenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const findToken = useCallback(async (chainId: number, address: string, network: string) => {
    setLoading(true);
    setError(null);
    setToken(null);
    try {
      // 1. Find chain
      const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
      if (!chain) throw new Error('Unsupported chain');
      // 2. Use Infura endpoint from config for each chain
      const infuraUrl = config.INFURA_URLS[chainId];
      if (!infuraUrl) throw new Error('No Infura URL configured for this network');
      const client = createPublicClient({ chain, transport: http(infuraUrl) });
      // 3. Fetch token data from chain
      const [name, symbol, decimals] = await Promise.all([
        client.readContract({ address: address as `0x${string}`, abi: ERC20_ABI, functionName: 'name' }),
        client.readContract({ address: address as `0x${string}`, abi: ERC20_ABI, functionName: 'symbol' }),
        client.readContract({ address: address as `0x${string}`, abi: ERC20_ABI, functionName: 'decimals' }),
      ]);
      const tokenData: TokenData = {
        name: name as string,
        symbol: symbol as string,
        decimals: decimals as number,
        address,
        chainId,
        network,
        logo: ZERO_LOGO,
      };
      setToken(tokenData);
    } catch (err: any) {
      setError('Token not found');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    token,
    loading,
    error,
    findToken,
    resetError,
  };
}
