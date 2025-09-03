import { useMemo } from 'react';
import { usePoolStats } from '../../../lib/usePoolStats';

export interface StakingOption {
  key: string;
  title: string;
  label: string;
  multiplier: number;
  apy: number;
}

export interface UseStakingOptionsReturn {
  options: StakingOption[];
  loading: boolean;
  error: string | null;
}

// Standard lock duration options in days
const LOCK_DURATION_DAYS = [
  0,
  30,
  90,
  180,
  365,
];

export const useStakingOptions = (poolAddress: string, chainId: number): UseStakingOptionsReturn => {
  const { calculateMultiplier, calculateApy, loading, error } = usePoolStats(poolAddress, chainId);

  const options = useMemo(() => {
    if (!calculateMultiplier || !calculateApy) {
      // Fallback to basic options while loading
      return LOCK_DURATION_DAYS.map((days) => ({
        key: days.toString(),
        title: days === 0 ? 'No lock' : `${days} days`,
        label: 'Loading...',
        multiplier: 1,
        apy: 0,
      }));
    }

    return LOCK_DURATION_DAYS.map((days) => {
      const multiplier = calculateMultiplier(days);
      const apy = calculateApy(days);

      return {
        key: days.toString(),
        title: days === 0 ? 'No lock' : `${days} days`,
        label: '', // Temporarily hide rewards multipliers and APY
        multiplier,
        apy,
      };
    });
  }, [calculateMultiplier, calculateApy]);

  return {
    options,
    loading,
    error,
  };
};
