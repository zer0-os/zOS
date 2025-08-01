import { useQuery } from '@tanstack/react-query';
import { get } from '../../../lib/api/rest';

interface TokenGatedChannel {
  id: string;
  zid: string;
  name?: string;
  description?: string;
  tokenSymbol: string;
  tokenAmount: string;
  tokenAddress: string;
  network: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TokenGatedChannelsResponse {
  channels: TokenGatedChannel[];
  total: number;
  limit: number;
  offset: number;
}

export const useTokenGatedChannels = (type: 'mine' | 'all', limit: number = 100, offset: number = 0) => {
  return useQuery<TokenGatedChannelsResponse>({
    queryKey: [
      'token-gated-channels',
      type,
      limit,
      offset,
    ],
    queryFn: async () => {
      const response = await get(`/token-gated-channels/${type}?limit=${limit}&offset=${offset}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} token-gated channels`);
      }

      return response.body;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
