import { useQuery } from '@tanstack/react-query';
import { get } from '../../../lib/api/rest';

interface RewardConfig {
  timestamp: bigint;
  rewardsPerPeriod: bigint;
  periodLength: bigint;
  minimumLockTime: bigint;
  minimumRewardsMultiplier: bigint;
  maximumRewardsMultiplier: bigint;
  canExit: boolean;
}

export const usePoolStats = (poolAddress: string, chainId: number = 43113) => {
  // Fetch total staked
  const {
    data: totalStaked,
    isLoading: totalStakedLoading,
    error: totalStakedError,
  } = useQuery({
    queryKey: ['totalStaked', poolAddress, chainId],
    queryFn: async () => {
      const res = await get(`/api/staking/${poolAddress}/total-staked`);

      if (!res.ok) {
        throw new Error('Failed to fetch total staked');
      }

      return res.body;
    },
    enabled: !!poolAddress,
  });

  // Fetch pool configuration for APY calculation
  const {
    data: poolConfig,
    isLoading: poolConfigLoading,
    error: poolConfigError,
  } = useQuery({
    queryKey: ['poolConfig', poolAddress, chainId],
    queryFn: async (): Promise<RewardConfig> => {
      const res = await get(`/api/staking/${poolAddress}/config`).send();

      if (!res.ok) {
        throw new Error('Failed to fetch pool config');
      }

      return {
        timestamp: BigInt(res.body.timestamp),
        rewardsPerPeriod: BigInt(res.body.rewardsPerPeriod),
        periodLength: BigInt(res.body.periodLength),
        minimumLockTime: BigInt(res.body.minimumLockTime),
        minimumRewardsMultiplier: BigInt(res.body.minimumRewardsMultiplier),
        maximumRewardsMultiplier: BigInt(res.body.maximumRewardsMultiplier),
        canExit: res.body.canExit,
      };
    },
    enabled: !!poolAddress,
  });

  // Calculate APY and multiplier utilities from pool configuration
  const apyData = poolConfig
    ? (() => {
        const { rewardsPerPeriod, periodLength, minimumRewardsMultiplier, maximumRewardsMultiplier } = poolConfig;

        // Convert BigInt to numbers for calculations
        const rewardsPerPeriodWei = rewardsPerPeriod;
        const periodLengthSeconds = Number(periodLength);
        const minMultiplier = Number(minimumRewardsMultiplier);
        const maxMultiplier = Number(maximumRewardsMultiplier);

        // Calculate annual periods
        const secondsPerYear = 365.25 * 24 * 60 * 60;
        const periodsPerYear = secondsPerYear / periodLengthSeconds;

        // Base APY calculation - independent of current staking amount
        // APY represents the annual percentage yield based on pool reward configuration
        const annualRewardsWei = rewardsPerPeriodWei * BigInt(Math.floor(periodsPerYear)) * BigInt(minMultiplier);
        const periodLengthBigInt = BigInt(periodLengthSeconds);

        // Calculate APY as percentage of rewards relative to staked amount per period
        // Formula: (rewardsPerPeriod * periodsPerYear * minMultiplier * 100) / (periodLength * 1e18)
        // We use 1e18 (1 token in wei) as the base unit to get percentage
        const baseApyNumerator = annualRewardsWei * BigInt(100);
        const baseApyDenominator = periodLengthBigInt * BigInt(1e18);

        const baseApy = baseApyDenominator > 0 ? Number(baseApyNumerator) / Number(baseApyDenominator) : 0;

        // Maximum APY (for maximum lock duration)
        const maxApy = baseApy * (maxMultiplier / minMultiplier);

        // Function to calculate multiplier for a given lock duration in days
        const calculateMultiplier = (lockDurationDays: number): number => {
          if (lockDurationDays === 0) return minMultiplier / 100; // Convert to decimal

          const lockDurationSeconds = lockDurationDays * 24 * 60 * 60;
          const multiplierRange = maxMultiplier - minMultiplier;
          const lockRatio = lockDurationSeconds / periodLengthSeconds;
          const multiplier = minMultiplier + multiplierRange * lockRatio;

          return Math.min(multiplier / 100, maxMultiplier / 100); // Convert to decimal and cap at max
        };

        // Function to calculate APY for a given lock duration
        const calculateApy = (lockDurationDays: number): number => {
          const multiplier = calculateMultiplier(lockDurationDays);
          return baseApy * (multiplier / (minMultiplier / 100));
        };

        return {
          baseApy,
          maxApy,
          calculateMultiplier,
          calculateApy,
          minMultiplier: minMultiplier / 100, // Convert to decimal
          maxMultiplier: maxMultiplier / 100, // Convert to decimal
        };
      })()
    : null;

  const loading = totalStakedLoading || poolConfigLoading;
  const error = totalStakedError || poolConfigError;

  const result = {
    totalStaked,
    apy: apyData?.baseApy || null,
    apyRange: apyData ? { min: apyData.baseApy, max: apyData.maxApy } : null,
    calculateMultiplier: apyData?.calculateMultiplier || null,
    calculateApy: apyData?.calculateApy || null,
    loading,
    error: error?.message || null,
  };

  return result;
};
