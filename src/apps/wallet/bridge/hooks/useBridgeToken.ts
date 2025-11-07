import { useMutation } from '@tanstack/react-query';
import { bridgeTokenRequest, BridgeTokenPayload } from '../../queries/bridgeQueries';
import { normalizeWalletError } from '../lib/utils';

interface UseBridgeTokenParams {
  zeroWalletAddress: string | undefined;
  onSuccess?: (transactionHash: string) => void;
  onError?: (error: Error) => void;
}

export function useBridgeToken({ zeroWalletAddress, onSuccess, onError }: UseBridgeTokenParams) {
  return useMutation({
    mutationFn: async (params: {
      tokenAddress: string;
      amount: string;
      to: string;
      fromChainId: number;
      toChainId: number;
    }): Promise<string> => {
      if (!zeroWalletAddress) {
        throw new Error('Zero Wallet address not found');
      }
      if (!params.tokenAddress) {
        throw new Error('Token address is required');
      }

      const payload: BridgeTokenPayload = {
        tokenAddress: params.tokenAddress,
        amount: params.amount,
        to: params.to,
        fromChainId: params.fromChainId,
        toChainId: params.toChainId,
      };

      try {
        const response = await bridgeTokenRequest(zeroWalletAddress, payload);
        return response.transactionHash;
      } catch (error) {
        const normalizedError = normalizeWalletError(error);
        onError?.(normalizedError);
        throw normalizedError;
      }
    },
    onSuccess,
    onError,
  });
}
