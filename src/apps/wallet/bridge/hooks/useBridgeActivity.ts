import { useQuery } from '@tanstack/react-query';
import { bridgeActivityRequest } from '../../queries/bridgeQueries';

interface UseBridgeActivityParams {
  zeroWalletAddress: string | undefined;
  fromChainId?: number;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function useBridgeActivity({
  zeroWalletAddress,
  fromChainId,
  limit = 25,
  offset = 0,
  enabled = true,
}: UseBridgeActivityParams) {
  return useQuery({
    queryKey: [
      'bridge-activity',
      zeroWalletAddress,
      fromChainId,
      limit,
      offset,
    ],
    queryFn: async () => {
      if (!zeroWalletAddress) return { deposits: [], totalCount: 0 };
      return bridgeActivityRequest(zeroWalletAddress, { fromChainId, limit, offset });
    },
    enabled: enabled && !!zeroWalletAddress,
    staleTime: 1000 * 30, // 30 seconds
  });
}
