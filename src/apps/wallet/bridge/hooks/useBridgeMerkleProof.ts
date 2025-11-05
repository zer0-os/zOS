import { useQuery } from '@tanstack/react-query';
import { merkleProofRequest } from '../../queries/bridgeQueries';

interface UseBridgeMerkleProofParams {
  zeroWalletAddress: string | undefined;
  depositCount: number | undefined;
  netId: number;
  fromChainId: number;
  enabled?: boolean;
}

export function useBridgeMerkleProof({
  zeroWalletAddress,
  depositCount,
  netId,
  fromChainId,
  enabled = true,
}: UseBridgeMerkleProofParams) {
  return useQuery({
    queryKey: [
      'bridge-merkle-proof',
      zeroWalletAddress,
      depositCount,
      netId,
      fromChainId,
    ],
    queryFn: async () => {
      if (!zeroWalletAddress || !depositCount) return null;
      return merkleProofRequest(zeroWalletAddress, depositCount, {
        netId,
        fromChainId,
      });
    },
    enabled: enabled && !!zeroWalletAddress && !!depositCount,
  });
}
