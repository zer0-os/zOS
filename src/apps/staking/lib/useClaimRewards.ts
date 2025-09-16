import { useMutation } from '@tanstack/react-query';
import { post } from '../../../lib/api/rest';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { queryClient } from '../../../lib/web3/rainbowkit/provider';
import { isWalletAPIError } from '../../../store/wallet/utils';

export const useClaimRewards = (poolAddress: string, chainId: number) => {
  const { address: userAddress } = useSelector(selectedWalletSelector);

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await post(`/api/wallet/${userAddress}/transactions/claim-staking-rewards`).send({
          poolAddress,
          chainId,
        });

        return response.body;
      } catch (e) {
        if (isWalletAPIError(e) && e.response.body.code === 'INSUFFICIENT_BALANCE') {
          throw new Error('Gas balance is not enough for this transaction');
        }
        console.error(e);
        throw new Error('Failed to claim rewards.');
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(
        [
          'userPendingRewards',
          poolAddress,
          userAddress,
          chainId,
        ],
        BigInt(0)
      );
      queryClient.invalidateQueries({
        queryKey: [
          'userPendingRewards',
          poolAddress,
          userAddress,
          chainId,
        ],
      });
    },
  });
};
