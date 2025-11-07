import { useQuery } from '@tanstack/react-query';
import { getDestinationChainId } from '../lib/utils';
import { CURATED_TOKENS } from '../lib/tokens';

export interface CounterpartToken {
  symbol: string;
  name: string;
  chainId: number;
  tokenAddress: string;
  decimals: number;
  logoUrl?: string;
}

/**
 * Fetches the counterpart token on the destination chain
 * For now, uses curated tokens list to find by symbol match
 * TODO: Add bridge contract integration to get wrapped token address
 */
export function useFetchCounterpartToken(fromToken: { chainId: number; tokenAddress: string; symbol: string } | null) {
  return useQuery({
    queryKey: ['counterpartToken', fromToken?.chainId, fromToken?.tokenAddress],
    queryFn: async (): Promise<CounterpartToken | null> => {
      if (!fromToken) return null;

      const toChainId = getDestinationChainId(fromToken.chainId);
      const curatedTokens = CURATED_TOKENS[toChainId] || [];

      // First, try to find by symbol in curated tokens
      const counterpartBySymbol = curatedTokens.find((token) => token.symbol === fromToken.symbol);

      if (counterpartBySymbol) {
        return {
          symbol: counterpartBySymbol.symbol,
          name: counterpartBySymbol.name,
          chainId: toChainId,
          tokenAddress: counterpartBySymbol.tokenAddress,
          decimals: counterpartBySymbol.decimals,
          logoUrl: counterpartBySymbol.logo,
        };
      }

      // If not found in curated tokens, we would need to fetch from bridge contract
      // For now, return null and let the UI handle it
      // TODO: Add bridge contract call to get wrapped token address
      return null;
    },
    enabled: !!fromToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
