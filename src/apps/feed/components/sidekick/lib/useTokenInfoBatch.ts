import { useQueries } from '@tanstack/react-query';
import { get } from '../../../../../lib/api/rest';
import { ChannelItem, TokenInfoResponse } from './types';

export const useTokenInfoBatch = (channels: ChannelItem[]) => {
  // Filter to only channels that have token requirements (token-gated channels)
  const tokenGatedChannels = channels.filter((channel) => channel.tokenAddress && channel.network);

  const zids = tokenGatedChannels.map((channel) => channel.zid);

  const results = useQueries({
    queries: zids.map((zid) => ({
      queryKey: ['token-info', zid],
      queryFn: async (): Promise<TokenInfoResponse> => {
        const response = await get(`/token-gated-channels/${zid}/token/info`);

        if (!response.ok) {
          throw new Error(`Failed to fetch token info for ${zid}`);
        }

        return response.body;
      },
      enabled: !!zid,
      staleTime: 1000 * 60 * 2, // 2 minutes - token prices change frequently
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    })),
  });

  const tokenInfoMap = new Map<string, TokenInfoResponse>();
  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);

  results.forEach((result, index) => {
    if (result.data && zids[index]) {
      tokenInfoMap.set(zids[index], result.data);
    }
  });

  return {
    tokenInfoMap,
    isLoading,
    isError,
    results,
  };
};
