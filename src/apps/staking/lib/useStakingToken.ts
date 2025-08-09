import { useQuery } from '@tanstack/react-query';
import { get } from '../../../lib/api/rest';

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
}

export const useStakingToken = (poolAddress: string) => {
  // Fetch staking token address
  const {
    data: stakingTokenAddress,
    isLoading: stakingTokenLoading,
    error: stakingTokenError,
  } = useQuery({
    queryKey: ['stakingTokenAddress', poolAddress],
    queryFn: async () => {
      const res = await get(`/api/staking/${poolAddress}/staking-token`).send();

      if (!res.ok) {
        throw new Error('Failed to fetch staking token address');
      }

      return res.body.stakingTokenAddress;
    },
    enabled: !!poolAddress,
  });

  // Fetch staking token info
  const {
    data: stakingTokenInfo,
    isLoading: stakingTokenInfoLoading,
    error: stakingTokenInfoError,
  } = useQuery({
    queryKey: ['stakingTokenInfo', stakingTokenAddress],
    queryFn: async () => {
      if (!stakingTokenAddress) return null;

      const res = await get(`/api/tokens/${stakingTokenAddress}/info`).send();

      if (!res.ok) {
        throw new Error('Failed to fetch staking token info');
      }

      return {
        name: res.body.name,
        symbol: res.body.symbol,
        decimals: res.body.decimals,
        address: stakingTokenAddress,
      };
    },
    enabled: !!stakingTokenAddress,
  });

  const loading = stakingTokenLoading || stakingTokenInfoLoading;
  const error = stakingTokenError || stakingTokenInfoError;

  return {
    stakingTokenAddress,
    stakingTokenInfo,
    loading,
    error: error?.message || null,
  };
};
