import { parseAbi } from 'viem';
import { readContract } from '@wagmi/core';
import { useQuery } from '@tanstack/react-query';
import { StakingERC20ABI } from './abi/StakingERC20';
import { getWagmiConfig } from '../../../lib/web3/wagmi-config';

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

export const useRewardsToken = (poolAddress: string, chainId?: number) => {
  // Fetch rewards token address
  const {
    data: rewardsTokenAddress,
    isLoading: rewardsTokenLoading,
    error: rewardsTokenError,
  } = useQuery({
    queryKey: ['rewardsTokenAddress', poolAddress, chainId],
    queryFn: async () => {
      const result = await readContract(getWagmiConfig(), {
        address: poolAddress as `0x${string}`,
        abi: StakingERC20ABI,
        functionName: 'rewardsToken',
        chainId: chainId || 43113,
      });
      return result as string;
    },
    enabled: !!poolAddress,
  });

  // Fetch rewards token info
  const {
    data: rewardsTokenInfo,
    isLoading: rewardsTokenInfoLoading,
    error: rewardsTokenInfoError,
  } = useQuery({
    queryKey: ['rewardsTokenInfo', rewardsTokenAddress, chainId],
    queryFn: async () => {
      if (!rewardsTokenAddress) return null;

      const [name, symbol, decimals] = await Promise.all([
        readContract(getWagmiConfig(), {
          address: rewardsTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'name',
          chainId: chainId || 43113,
        }),
        readContract(getWagmiConfig(), {
          address: rewardsTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'symbol',
          chainId: chainId || 43113,
        }),
        readContract(getWagmiConfig(), {
          address: rewardsTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'decimals',
          chainId: chainId || 43113,
        }),
      ]);

      return {
        name: name as string,
        symbol: symbol as string,
        decimals: decimals as number,
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
