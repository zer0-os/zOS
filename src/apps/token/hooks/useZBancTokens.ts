import { useQuery } from '@tanstack/react-query';
import { get } from '../../../lib/api/rest';
import { ZBancToken } from '../components/utils';

interface ZBancTokensResponse {
  success: boolean;
  data: ZBancToken[];
}

export const useZBancTokens = () => {
  return useQuery<ZBancToken[]>({
    queryKey: ['zbanc-tokens'],
    queryFn: async () => {
      const response = await get('/zbanc/tokens');

      if (!response.ok) {
        throw new Error('Failed to fetch ZBanc tokens');
      }

      const result: ZBancTokensResponse = response.body;

      if (!result.success) {
        throw new Error('Failed to fetch ZBanc tokens');
      }

      return result.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
