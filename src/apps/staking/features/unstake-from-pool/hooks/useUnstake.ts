import { useMutation } from '@tanstack/react-query';
import { post } from '../../../../../lib/api/rest';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../../../store/wallet/selectors';
import { queryClient } from '../../../../../lib/web3/rainbowkit/provider';

export const useUnstake = () => {
  const { address: userAddress } = useSelector(selectedWalletSelector);

  return useMutation({
    mutationFn: async ({ amountWei, poolAddress }: { amountWei: BigInt; poolAddress: string }) => {
      const response = await post(`/api/wallet/${userAddress}/transactions/unstake`).send({
        amount: amountWei.toString(),
        poolAddress,
      });

      return response.body;
    },
    onSuccess: (_, { poolAddress }) => {
      queryClient.invalidateQueries({ queryKey: ['userPendingRewards', poolAddress, userAddress] });
      queryClient.invalidateQueries({ queryKey: ['userStakedAmount', poolAddress, userAddress] });
      queryClient.invalidateQueries({ queryKey: ['userStakedAmount', poolAddress, userAddress] });
    },
  });
};
