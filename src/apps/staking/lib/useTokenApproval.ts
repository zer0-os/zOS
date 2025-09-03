import { useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../../../lib/api/rest';
import { isWalletAPIError } from '../../../store/wallet/utils';

interface ApprovalParams {
  userAddress: string;
  tokenAddress: string;
  spenderAddress: string;
  amount: string;
  chainId: number;
}

export const useTokenApproval = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ userAddress, tokenAddress, spenderAddress, amount, chainId }: ApprovalParams) => {
      if (!userAddress) {
        throw new Error('User not connected');
      }

      let response;
      // Use zOS API for token approval
      try {
        response = await post(`/api/wallet/${userAddress}/transactions/approve-erc20`).send({
          spenderAddress,
          amount,
          tokenAddress,
          chainId,
        });
      } catch (e) {
        if (isWalletAPIError(e) && e.response.body.code === 'INSUFFICIENT_BALANCE') {
          throw new Error('Gas balance is not enough for this transaction');
        }
        console.error(e);
        throw new Error('Failed to approve spending.');
      }

      if (response.body?.transactionHash) {
        const receiptResponse = await get(
          `/api/wallet/transaction/${response.body.transactionHash}/receipt?chainId=${chainId}`
        ).send();

        if (receiptResponse.body.status === 'confirmed') {
          return { success: true, hash: response.body.transactionHash, receipt: receiptResponse.body };
        } else {
          throw new Error('Transaction failed');
        }
      } else {
        throw new Error('No transaction hash received from API');
      }
    },
    onSuccess: (_data, { userAddress, tokenAddress, spenderAddress, chainId }) => {
      // Invalidate allowance queries when approval succeeds
      queryClient.invalidateQueries({
        queryKey: [
          'tokenAllowance',
          tokenAddress,
          spenderAddress,
          userAddress,
          chainId,
        ],
      });
    },
  });

  const approve = async (
    userAddress: string,
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    chainId: number
  ) => {
    try {
      const result = await mutation.mutateAsync({ userAddress, tokenAddress, spenderAddress, amount, chainId });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Approval failed';
      return { success: false, error: errorMessage };
    }
  };

  return {
    approve,
    isApproving: mutation.isPending,
    error: mutation.error?.message || null,
  };
};
