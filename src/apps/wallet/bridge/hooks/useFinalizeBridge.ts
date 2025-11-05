import { useMutation } from '@tanstack/react-query';
import { finalizeBridgeRequest, BridgeStatusResponse, BridgeMerkleProofData } from '../../queries/bridgeQueries';
import { CHAIN_ID_ETHEREUM, CHAIN_ID_SEPOLIA } from '../lib/utils';

interface UseFinalizeBridgeParams {
  eoaAddress: string | undefined;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useFinalizeBridge({ eoaAddress, onSuccess, onError }: UseFinalizeBridgeParams) {
  return useMutation({
    mutationFn: async (params: {
      status: BridgeStatusResponse;
      merkleProof: BridgeMerkleProofData;
      toChainId: number;
    }): Promise<{ transactionHash: string }> => {
      if (!eoaAddress) {
        throw new Error('EOA address not found');
      }
      if (!params.status || !params.merkleProof) {
        throw new Error('Missing required data for finalization');
      }

      const destinationChainId = params.toChainId === CHAIN_ID_ETHEREUM ? CHAIN_ID_ETHEREUM : CHAIN_ID_SEPOLIA;

      return finalizeBridgeRequest(eoaAddress, {
        depositCount: params.status.depositCount,
        merkleProof: params.merkleProof.merkleProof,
        rollupMerkleProof: params.merkleProof.rollupMerkleProof,
        mainExitRoot: params.merkleProof.mainExitRoot,
        rollupExitRoot: params.merkleProof.rollupExitRoot,
        destinationAddress: params.status.destinationAddress,
        amount: params.status.amount,
        tokenAddress: params.status.tokenAddress,
        chainId: destinationChainId,
      });
    },
    onSuccess,
    onError,
  });
}
