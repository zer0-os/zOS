import { useQuery } from '@tanstack/react-query';
import { bridgeActivityRequest } from '../../queries/bridgeQueries';

interface UseBridgeActivityParams {
  address: string | undefined;
  fromChainId?: number;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function useBridgeActivity({
  address,
  fromChainId,
  limit = 25,
  offset = 0,
  enabled = true,
}: UseBridgeActivityParams) {
  return useQuery({
    queryKey: [
      'bridge-activity',
      address,
      fromChainId,
      limit,
      offset,
    ],
    queryFn: async () => {
      if (!address) return { deposits: [], totalCount: 0 };
      return bridgeActivityRequest(address, { fromChainId, limit, offset });
    },
    enabled: enabled && !!address,
    staleTime: 1000 * 30, // 30 seconds
  });
}
