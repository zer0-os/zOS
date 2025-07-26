import { useMutation } from '@tanstack/react-query';
import { post } from '../../../lib/api/rest';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { queryClient } from '../../../lib/web3/rainbowkit/provider';

export const useClaimRewards = (poolAddress: string) => {
  const { address: userAddress } = useSelector(selectedWalletSelector);

  return useMutation({
    mutationFn: async () => {
      const response = await post(`/api/wallet/${userAddress}/transactions/claim-staking-rewards`).send({
        poolAddress,
      });

      return response.body;
    },
    onSuccess: () => {
      queryClient.setQueryData(['userPendingRewards', poolAddress, userAddress], BigInt(0));
      queryClient.invalidateQueries({ queryKey: ['userPendingRewards', poolAddress, userAddress] });
    },
  });
};
