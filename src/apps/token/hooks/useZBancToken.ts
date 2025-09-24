import { useQuery } from '@tanstack/react-query';
import { get } from '../../../lib/api/rest';
import { config } from '../../../config';
import { ZBancToken } from '../components/utils';

interface ZBancTokenResponse {
  success: boolean;
  data: ZBancToken;
}

export const useZBancToken = (tokenAddress: string) => {
  return useQuery<ZBancToken>({
    queryKey: ['zbanc-token', tokenAddress],
    queryFn: async () => {
      if (!tokenAddress) {
        throw new Error('Token address is required');
      }

      const response = await get(`/api/zbanc/token/${tokenAddress}?chainId=${config.zChainId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch ZBanc token');
      }

      const result: ZBancTokenResponse = response.body;

      if (!result.success) {
        throw new Error('Failed to fetch ZBanc token');
      }

      return result.data;
    },
    enabled: !!tokenAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
