import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { get, post } from '../../../lib/api/rest';

interface StakingParams {
  poolAddress: string;
  amount: string;
  lockDuration?: string;
}

export const useStaking = () => {
  const { address: userAddress } = useSelector(selectedWalletSelector);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ poolAddress, amount, lockDuration }: StakingParams) => {
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
        });
      } catch (e) {
        console.error(e);
        throw new Error('Failed to stake tokens, please try again.');
      }

      if (response.body?.transactionHash) {
        const receiptResponse = await get(`/api/wallet/transaction/${response.body.transactionHash}/receipt`).send();

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

  const executeStake = async (poolAddress: string, amount: string, lockDuration?: string) => {
    try {
      const result = await mutation.mutateAsync({ poolAddress, amount, lockDuration });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Staking failed';
      return { success: false, error: errorMessage };
    }
  };

  const stakeWithLock = async (poolAddress: string, amount: string, lockDuration: string) => {
    return executeStake(poolAddress, amount, lockDuration);
  };

  const stakeWithoutLock = async (poolAddress: string, amount: string) => {
    return executeStake(poolAddress, amount);
  };

  return {
    stakeWithLock,
    stakeWithoutLock,
    isStaking: mutation.isPending,
    error: mutation.error?.message || null,
  };
};
