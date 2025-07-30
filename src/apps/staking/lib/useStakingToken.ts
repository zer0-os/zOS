import { parseAbi } from 'viem';
import { readContract } from '@wagmi/core';
import { useQuery } from '@tanstack/react-query';
import { getWagmiConfig } from '../../../lib/web3/wagmi-config';
import { get } from '../../../lib/api/rest';

const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
]);

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
}

export const useStakingToken = (poolAddress: string, chainId?: number) => {
  // Fetch staking token address
  const {
    data: stakingTokenAddress,
    isLoading: stakingTokenLoading,
    error: stakingTokenError,
  } = useQuery({
    queryKey: ['stakingTokenAddress', poolAddress, chainId],
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
    queryKey: ['stakingTokenInfo', stakingTokenAddress, chainId],
    queryFn: async () => {
      if (!stakingTokenAddress) return null;

      const [name, symbol, decimals] = await Promise.all([
        readContract(getWagmiConfig(), {
          address: stakingTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'name',
          chainId: chainId || 43113,
        }),
        readContract(getWagmiConfig(), {
          address: stakingTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'symbol',
          chainId: chainId || 43113,
        }),
        readContract(getWagmiConfig(), {
          address: stakingTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'decimals',
          chainId: chainId || 43113,
        }),
      ]);

      return {
        name: name as string,
        symbol: symbol as string,
        decimals: decimals as number,
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
