import { useQuery } from '@tanstack/react-query';
import { get } from '../../../lib/api/rest';

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
}

export const useRewardsToken = (poolAddress: string) => {
  // Fetch rewards token address
  const {
    data: rewardsTokenAddress,
    isLoading: rewardsTokenLoading,
    error: rewardsTokenError,
  } = useQuery({
    queryKey: ['rewardsTokenAddress', poolAddress],
    queryFn: async () => {
      const res = await get(`/api/staking/${poolAddress}/rewards-token`).send();

      if (!res.ok) {
        throw new Error('Failed to fetch rewards token address');
      }

      return res.body.rewardsTokenAddress;
    },
    enabled: !!poolAddress,
  });

  // Fetch rewards token info
  const {
    data: rewardsTokenInfo,
    isLoading: rewardsTokenInfoLoading,
    error: rewardsTokenInfoError,
  } = useQuery({
    queryKey: ['rewardsTokenInfo', rewardsTokenAddress],
    queryFn: async () => {
      if (!rewardsTokenAddress) return null;

      const res = await get(`/api/tokens/${rewardsTokenAddress}/info`).send();

      if (!res.ok) {
        throw new Error('Failed to fetch rewards token info');
      }

      return {
        name: res.body.name,
        symbol: res.body.symbol,
        decimals: res.body.decimals,
        address: rewardsTokenAddress,
      };
    },
    enabled: !!rewardsTokenAddress,
  });

  const loading = rewardsTokenLoading || rewardsTokenInfoLoading;
  const error = rewardsTokenError || rewardsTokenInfoError;

  return {
    rewardsTokenAddress,
    rewardsTokenInfo,
    loading,
    error: error?.message || null,
  };
};
