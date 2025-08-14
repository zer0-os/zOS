import { useStakingToken } from './useStakingToken';
import { useRewardsToken } from './useRewardsToken';
import { useUserBalances } from './useUserBalances';
import { useUserStakingInfo } from './useUserStakingInfo';
import { usePoolStats } from './usePoolStats';

// Re-export interfaces from individual hooks
export type { TokenInfo } from './useStakingToken';
export type { UserStakingInfo } from './useUserStakingInfo';

export const usePool = (poolAddress: string) => {
  // Use individual hooks
  const stakingToken = useStakingToken(poolAddress);
  const rewardsToken = useRewardsToken(poolAddress);
  const userBalances = useUserBalances(stakingToken.stakingTokenAddress, rewardsToken.rewardsTokenAddress);
  const userStakingInfo = useUserStakingInfo(poolAddress);
  const poolStats = usePoolStats(poolAddress);

  // Aggregate loading and error states
  const loading =
    stakingToken.loading ||
    rewardsToken.loading ||
    userBalances.loading ||
    userStakingInfo.loading ||
    poolStats.loading;

  const error =
    stakingToken.error || rewardsToken.error || userBalances.error || userStakingInfo.error || poolStats.error;

  return {
    stakingTokenInfo: stakingToken.stakingTokenInfo,
    rewardsTokenInfo: rewardsToken.rewardsTokenInfo,
    userStakingBalance: userBalances.userStakingBalance,
    userRewardsBalance: userBalances.userRewardsBalance,
    userStakedAmount: userStakingInfo.userStakingInfo?.amountStaked || null,
    userStakedAmountLocked: userStakingInfo.userStakingInfo?.amountStakedLocked || null,
    userUnlockedTimestamp: userStakingInfo.userStakingInfo?.unlockedTimestamp || null,
    userPendingRewards: userStakingInfo.userPendingRewards,
    totalStaked: poolStats.totalStaked,
    loading,
    error,
  };
};
