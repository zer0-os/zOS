import { useQuery } from '@tanstack/react-query';
import { bridgeStatusRequest } from '../../queries/bridgeQueries';

interface UseBridgeStatusParams {
  zeroWalletAddress: string | undefined;
  depositCount: number | undefined;
  fromChainId: number;
  enabled?: boolean;
  refetchInterval?: number | false | ((query: any) => number | false);
}

export function useBridgeStatus({
  zeroWalletAddress,
  depositCount,
  fromChainId,
  enabled = true,
  refetchInterval,
}: UseBridgeStatusParams) {
  return useQuery({
    queryKey: [
      'bridge-status',
      zeroWalletAddress,
      depositCount,
      fromChainId,
    ],
    queryFn: async () => {
      if (!zeroWalletAddress || depositCount === undefined) return null;
      return bridgeStatusRequest(zeroWalletAddress, depositCount, fromChainId);
    },
    enabled: enabled && !!zeroWalletAddress && depositCount !== undefined,
    refetchInterval:
      refetchInterval !== undefined
        ? refetchInterval
        : (query) => {
            const currentStatus = query.state.data?.status;
            // Stop polling if completed or failed
            if (currentStatus === 'completed' || currentStatus === 'failed') return false;
            // Poll every 5 seconds while processing
            return 5000;
          },
  });
}
