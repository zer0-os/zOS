import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { get, post } from '../../../lib/api/rest';
import { isWalletAPIError } from '../../../store/wallet/utils';

interface StakingParams {
  poolAddress: string;
  amount: string;
  lockDuration?: string;
  chainId: number;
}

export const useStaking = () => {
  const { address: userAddress } = useSelector(selectedWalletSelector);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ poolAddress, amount, lockDuration, chainId }: StakingParams) => {
      if (!userAddress) {
        throw new Error('User not connected');
      }

      let response;
      // Use zOS API for token approval
      try {
        response = await post(`/api/wallet/${userAddress}/transactions/stake${lockDuration ? '-with-lock' : ''}`).send({
          poolAddress,
          amount,
          lockDuration,
          chainId,
        });
      } catch (e) {
        if (isWalletAPIError(e) && e.response.body.code === 'INSUFFICIENT_BALANCE') {
          throw new Error('Gas balance is not enough for this transaction');
        }
        console.error(e);
        throw new Error('Failed to stake tokens, please try again.');
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
      }
    },
    onSuccess: (_, { poolAddress }) => {
      // Invalidate all staking-related queries when staking succeeds
      queryClient.invalidateQueries({
        queryKey: ['userStakingBalance'],
      });
      queryClient.invalidateQueries({
        queryKey: ['userRewardsBalance'],
      });
      queryClient.invalidateQueries({
        queryKey: ['userStakingInfo', poolAddress],
      });
      queryClient.invalidateQueries({
        queryKey: ['userPendingRewards', poolAddress],
      });
      queryClient.invalidateQueries({
        queryKey: ['totalStaked', poolAddress],
      });
      queryClient.invalidateQueries({
        queryKey: ['poolConfig', poolAddress],
      });
    },
  });

  const executeStake = async (poolAddress: string, amount: string, chainId: number, lockDuration?: string) => {
    try {
      const result = await mutation.mutateAsync({ poolAddress, amount, lockDuration, chainId });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Staking failed';
      return { success: false, error: errorMessage };
    }
  };

  const stakeWithLock = async (poolAddress: string, amount: string, chainId: number, lockDuration: string) => {
    return executeStake(poolAddress, amount, chainId, lockDuration);
  };

  const stakeWithoutLock = async (poolAddress: string, amount: string, chainId: number) => {
    return executeStake(poolAddress, amount, chainId);
  };

  return {
    stakeWithLock,
    stakeWithoutLock,
    isStaking: mutation.isPending,
    error: mutation.error?.message || null,
  };
};
