import { useMutation } from '@tanstack/react-query';
import { post } from '../../../../../lib/api/rest';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../../../store/wallet/selectors';
import { queryClient } from '../../../../../lib/web3/rainbowkit/provider';

export const useUnstake = () => {
  const { address: userAddress } = useSelector(selectedWalletSelector);

  return useMutation({
    mutationFn: async ({
      amountWei,
      poolAddress,
      chainId,
    }: {
      amountWei: BigInt;
      poolAddress: string;
      chainId: number;
    }) => {
      const response = await post(`/api/wallet/${userAddress}/transactions/unstake`).send({
        amount: amountWei.toString(),
        poolAddress,
        chainId,
      });

      return response.body;
    },
    onSuccess: (_, { poolAddress, chainId }) => {
      queryClient.invalidateQueries({
        queryKey: [
          'userPendingRewards',
          poolAddress,
          userAddress,
          chainId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'userStakedAmount',
          poolAddress,
          userAddress,
          chainId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'userStakedAmount',
          poolAddress,
          userAddress,
          chainId,
        ],
      });
    },
  });
};
