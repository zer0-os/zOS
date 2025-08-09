import { useQuery } from '@tanstack/react-query';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { useSelector } from 'react-redux';
import { get } from '../../../lib/api/rest';

export const useUserBalances = (stakingTokenAddress: string | null, rewardsTokenAddress: string | null) => {
  const { address: userAddress } = useSelector(selectedWalletSelector);

  // Fetch user staking token balance
  const {
    data: userStakingBalance,
    isLoading: userStakingBalanceLoading,
    error: userStakingBalanceError,
  } = useQuery({
    queryKey: [
      'userStakingBalance',
      stakingTokenAddress,
      userAddress,
    ],
    queryFn: async () => {
      if (!stakingTokenAddress || !userAddress) return null;

      const res = await get(`/api/wallet/${userAddress}/token/${stakingTokenAddress}/balance`).send();

      if (!res.ok) {
        throw new Error('Failed to fetch staking token balance');
      }

      return res.body.balance;
    },
    enabled: !!stakingTokenAddress && !!userAddress,
  });

  // Fetch user rewards token balance
  const {
    data: userRewardsBalance,
    isLoading: userRewardsBalanceLoading,
    error: userRewardsBalanceError,
  } = useQuery({
    queryKey: [
      'userRewardsBalance',
      rewardsTokenAddress,
      userAddress,
    ],
    queryFn: async () => {
      if (!rewardsTokenAddress || !userAddress) return null;

      const res = await get(`/api/wallet/${userAddress}/token/${rewardsTokenAddress}/balance`).send();

      if (!res.ok) {
        throw new Error('Failed to fetch rewards token balance');
      }

      return res.body.balance;
    },
    enabled: !!rewardsTokenAddress && !!userAddress,
  });

  const loading = userStakingBalanceLoading || userRewardsBalanceLoading;
  const error = userStakingBalanceError || userRewardsBalanceError;

  return {
    userStakingBalance,
    userRewardsBalance,
    loading,
    error: error?.message || null,
  };
};
