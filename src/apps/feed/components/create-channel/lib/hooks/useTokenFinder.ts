import { useState, useCallback } from 'react';
import { createPublicClient, http, parseAbi } from 'viem';
import { mainnet, polygon, avalanche, arbitrum, optimism } from 'wagmi/chains';
import { config } from '../../../../../../config';

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

// Map chainId to CoinGecko chain slug
const COINGECKO_CHAIN_SLUGS: Record<number, string> = {
  1: 'ethereum',
  137: 'polygon-pos',
  43114: 'avalanche',
};

// zChain token data (hardcoded as requested)
const ZCHAIN_TOKENS = {
  MEOW: {
    name: 'MEOW',
    symbol: 'MEOW',
    decimals: 18,
    address: '0x6ce4a22AA99F9ae41D27E1eC3f40c32b8D0C3113',
    logo: '/tokens/meow.png',
  },
  CATNIP: {
    name: 'CATNIP',
    symbol: 'CATNIP',
    decimals: 18,
    address: '0xc106C2851cAFf4f7c361948719085eeC8171DF04',
    logo: null,
  },
};

export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  chainId: number;
  network: string;
  logo: string | null;
}

export function useTokenFinder() {
  const [token, setToken] = useState<TokenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const findZChainToken = useCallback(async (tokenSymbol: 'MEOW' | 'CATNIP', network: string) => {
    setLoading(true);
    setError(null);
    setToken(null);

    try {
      const tokenData = ZCHAIN_TOKENS[tokenSymbol];
      if (!tokenData) {
        throw new Error('Token not found');
      }

      const tokenResult: TokenData = {
        ...tokenData,
        chainId: 9369, // zChain chain ID (production)
        network,
      };

      setToken(tokenResult);
    } catch (err: any) {
      setError('Token not found');
    } finally {
      setLoading(false);
    }
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

      // 4. Try to fetch logo from CoinGecko
      let logo: string | null = null;
      const coingeckoChain = COINGECKO_CHAIN_SLUGS[chainId];
      if (coingeckoChain) {
        try {
          const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coingeckoChain}/contract/${address.toLowerCase()}`
          );
          if (res.ok) {
            const data = await res.json();
            logo = data.image?.large || data.image?.thumb || null;
          }
        } catch (e) {
          // Ignore logo fetch errors, fallback to null
        }
      }

      const tokenData: TokenData = {
        name: name as string,
        symbol: symbol as string,
        decimals: decimals as number,
        address,
        chainId,
        network,
        logo, // null if not found
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
    findZChainToken,
    resetError,
  };
}
