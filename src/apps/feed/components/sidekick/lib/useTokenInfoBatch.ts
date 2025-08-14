import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { get } from '../../../../../lib/api/rest';
import { ChannelItem, TokenInfoResponse } from './types';

export const useTokenInfoBatch = (channels: ChannelItem[]) => {
  console.log('XXX useTokenInfoBatch called with channels:', channels.length, 'channels');

  // Log a few sample channels to see their properties
  console.log(
    'XXX Sample channels:',
    channels.slice(0, 3).map((channel) => ({
      zid: channel.zid,
      tokenAddress: channel.tokenAddress,
      network: channel.network,
      tokenSymbol: channel.tokenSymbol,
      tokenAmount: channel.tokenAmount,
    }))
  );

  // Filter to only channels that have token requirements (token-gated channels)
  const tokenGatedChannels = useMemo(() => {
    return channels.filter((channel) => {
      const hasTokenAddress = !!channel.tokenAddress;
      const hasNetwork = !!channel.network;
      const isTokenGated = hasTokenAddress && hasNetwork;

      if (!isTokenGated) {
        console.log('XXX Channel NOT token-gated:', {
          zid: channel.zid,
          hasTokenAddress,
          hasNetwork,
          tokenAddress: channel.tokenAddress,
          network: channel.network,
        });
      }

      return isTokenGated;
    });
  }, [channels]);

  console.log('XXX tokenGatedChannels found:', tokenGatedChannels.length);

  // Group channels by token address to avoid duplicate API calls for the same token
  const tokenAddressMap = useMemo(() => {
    const map = new Map<string, string[]>();
    tokenGatedChannels.forEach((channel) => {
      const key = `${channel.tokenAddress}-${channel.network}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(channel.zid);
    });
    return map;
  }, [tokenGatedChannels]);

  const uniqueTokenQueries = useMemo(() => {
    return Array.from(tokenAddressMap.entries()).map(([tokenKey, zids]) => {
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
  }, [tokenAddressMap]);

  console.log('XXX uniqueTokenQueries:', uniqueTokenQueries.length, 'queries');

  const queries = useMemo(() => {
    return uniqueTokenQueries.map(({ tokenKey, representativeZid }) => ({
      queryKey: ['token-info', tokenKey],
      queryFn: async (): Promise<TokenInfoResponse> => {
        console.log('XXX Making API call for:', representativeZid);
        const response = await get(`/token-gated-channels/${representativeZid}/token/info`);

        if (!response.ok) {
          console.log('XXX API call failed for:', representativeZid, response.status);
          throw new Error(`Failed to fetch token info for ${representativeZid}`);
        }

        console.log('XXX API call successful for:', representativeZid, 'data:', response.body);
        return response.body;
      },
      enabled: !!representativeZid,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2, // Limit retries to avoid excessive requests
    }));
  }, [uniqueTokenQueries]);

  const results = useQueries({ queries });

  console.log(
    'XXX useQueries results:',
    results.map((r, i) => ({
      index: i,
      isLoading: r.isLoading,
      isError: r.isError,
      hasData: !!r.data,
      error: r.error,
    }))
  );

  const tokenInfoMap = new Map<string, TokenInfoResponse>();
  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);

  results.forEach((result, index) => {
    if (result.data) {
      const { zids } = uniqueTokenQueries[index];
      zids.forEach((zid) => {
        tokenInfoMap.set(zid, result.data);
        console.log('XXX Setting tokenInfo for zid:', zid, 'data:', result.data);
      });
    }
  });

  console.log('XXX Final tokenInfoMap size:', tokenInfoMap.size);
  console.log('XXX tokenInfoMap entries:', Array.from(tokenInfoMap.entries()));

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
