import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { get } from '../../../lib/api/rest';

export interface UserStakingInfo {
  unlockedTimestamp: bigint;
  amountStaked: bigint;
  amountStakedLocked: bigint;
  owedRewards: bigint;
  owedRewardsLocked: bigint;
  lastTimestamp: bigint;
  lastTimestampLocked: bigint;
}

export const useUserStakingInfo = (poolAddress: string, chainId?: number) => {
  const { address: userAddress } = useSelector(selectedWalletSelector);

  // Fetch user staking info
  const {
    data: userStakingInfo,
    isLoading: userStakingInfoLoading,
    error: userStakingInfoError,
  } = useQuery({
    queryKey: [
      'userStakingInfo',
      poolAddress,
      userAddress,
      chainId,
    ],
    queryFn: async () => {
      if (!poolAddress || !userAddress) return null;

      const res = await get(`/api/staking/${userAddress}/stakers/${poolAddress}`).send();

      if (!res.ok) {
        throw new Error('Failed to fetch user staking info');
      }

      const {
        unlockedTimestamp,
        amountStaked,
        amountStakedLocked,
        owedRewards,
        owedRewardsLocked,
        lastTimestamp,
        lastTimestampLocked,
      } = res.body;

      return {
        unlockedTimestamp,
        amountStaked,
        amountStakedLocked,
        owedRewards,
        owedRewardsLocked,
        lastTimestamp,
        lastTimestampLocked,
      };
    },
    enabled: !!poolAddress && !!userAddress,
  });

  // Fetch user pending rewards
  const {
    data: userPendingRewards,
    isLoading: userPendingRewardsLoading,
    error: userPendingRewardsError,
  } = useQuery({
    queryKey: [
      'userPendingRewards',
      poolAddress,
      userAddress,
    ],
    queryFn: async () => {
      if (!poolAddress || !userAddress) return null;

      const res = await get(`/api/staking/${userAddress}/rewards/${poolAddress}`);

      if (!res.ok || !res.body.pendingRewards) {
        throw new Error('Failed to fetch pending rewards');
      }

      return BigInt(res.body.pendingRewards);
    },
    enabled: !!poolAddress && !!userAddress,
  });

  const loading = userStakingInfoLoading || userPendingRewardsLoading;
  const error = userStakingInfoError || userPendingRewardsError;

  return {
    userStakingInfo,
    userPendingRewards,
    loading,
    error: error?.message || null,
  };
};
