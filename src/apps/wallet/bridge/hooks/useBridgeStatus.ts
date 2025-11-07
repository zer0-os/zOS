import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bridgeStatusRequest } from '../../queries/bridgeQueries';

interface UseBridgeStatusParams {
  zeroWalletAddress: string | undefined;
  transactionHash: string | null;
  fromChainId: number;
  enabled?: boolean;
  refetchInterval?: number | false | ((query: any) => number | false);
}

export function useBridgeStatus({
  zeroWalletAddress,
  transactionHash,
  fromChainId,
  enabled = true,
  refetchInterval,
}: UseBridgeStatusParams) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [
      'bridge-status',
      zeroWalletAddress,
      transactionHash,
      fromChainId,
    ],
    queryFn: async () => {
      if (!zeroWalletAddress || !transactionHash) return null;
      // Get depositCount from previous query result if available
      const previousStatus = queryClient.getQueryData<{
        depositCount?: number;
      }>([
        'bridge-status',
        zeroWalletAddress,
        transactionHash,
        fromChainId,
      ]);
      return bridgeStatusRequest(zeroWalletAddress, transactionHash, fromChainId, previousStatus?.depositCount);
    },
    enabled: enabled && !!zeroWalletAddress && !!transactionHash,
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
