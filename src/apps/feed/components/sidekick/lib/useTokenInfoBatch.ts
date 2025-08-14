import { useQueries } from '@tanstack/react-query';
import { get } from '../../../../../lib/api/rest';
import { ChannelItem, TokenInfoResponse } from './types';

export const useTokenInfoBatch = (channels: ChannelItem[]) => {
  // Filter to only channels that have token requirements (token-gated channels)
  const tokenGatedChannels = channels.filter((channel) => channel.tokenAddress && channel.network);

  // Group channels by token address to avoid duplicate API calls for the same token
  const tokenAddressMap = new Map<string, string[]>();

  tokenGatedChannels.forEach((channel) => {
    const key = `${channel.tokenAddress}-${channel.network}`;
    if (!tokenAddressMap.has(key)) {
      tokenAddressMap.set(key, []);
    }
    tokenAddressMap.get(key)!.push(channel.zid);
  });

  const uniqueTokenQueries = Array.from(tokenAddressMap.entries()).map(([tokenKey, zids]) => {
    const [tokenAddress, network] = tokenKey.split('-');
    const representativeZid = zids[0];

    return {
      tokenKey,
      tokenAddress,
      network,
      zids,
      representativeZid,
    };
  });

  const results = useQueries({
    queries: uniqueTokenQueries.map(({ tokenKey, representativeZid }) => ({
      queryKey: ['token-info', tokenKey],
      queryFn: async (): Promise<TokenInfoResponse> => {
        const response = await get(`/token-gated-channels/${representativeZid}/token/info`);

        if (!response.ok) {
          throw new Error(`Failed to fetch token info for ${representativeZid}`);
        }

        return response.body;
      },
      enabled: !!representativeZid,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2, // Limit retries to avoid excessive requests
    })),
  });

  const tokenInfoMap = new Map<string, TokenInfoResponse>();
  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);

  results.forEach((result, index) => {
    if (result.data) {
      const { zids } = uniqueTokenQueries[index];
      zids.forEach((zid) => {
        tokenInfoMap.set(zid, result.data);
      });
    }
  });

  return {
    tokenInfoMap,
    isLoading,
    isError,
    results,
    totalChannels: tokenGatedChannels.length,
    uniqueTokens: uniqueTokenQueries.length,
    optimizationRatio: tokenGatedChannels.length > 0 ? uniqueTokenQueries.length / tokenGatedChannels.length : 1,
  };
};
