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

export const useStakingToken = (poolAddress: string, chainId?: number) => {
  // Fetch staking token address
  const {
    data: stakingTokenAddress,
    isLoading: stakingTokenLoading,
    error: stakingTokenError,
  } = useQuery({
    queryKey: ['stakingTokenAddress', poolAddress, chainId],
    queryFn: async () => {
      const result = await readContract(getWagmiConfig(), {
        address: poolAddress as `0x${string}`,
        abi: StakingERC20ABI,
        functionName: 'stakingToken',
        chainId: chainId || 43113,
      });
      return result as string;
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
