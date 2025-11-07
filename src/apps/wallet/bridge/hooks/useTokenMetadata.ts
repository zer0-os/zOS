import { useQuery } from '@tanstack/react-query';
import { fetchTokenMetadata } from '../lib/rpc';

export interface UseTokenMetadataParams {
  chainId: number | undefined;
  tokenAddress: string | undefined;
  enabled?: boolean;
}

export function useTokenMetadata({ chainId, tokenAddress, enabled = true }: UseTokenMetadataParams) {
  return useQuery({
    queryKey: ['tokenMetadata', chainId, tokenAddress],
    queryFn: async () => {
      if (!chainId || !tokenAddress) {
        throw new Error('Chain ID and token address are required');
      }
      return fetchTokenMetadata(chainId, tokenAddress);
    },
    enabled: enabled && !!chainId && !!tokenAddress && isValidAddress(tokenAddress),
    staleTime: 1000 * 60 * 60, // 1 hour - token metadata doesn't change
    retry: false, // Don't retry - if token not found, fail fast
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes only
  });
}

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
