import { parseAbi } from 'viem';
import { readContract } from '@wagmi/core';
import { useQuery } from '@tanstack/react-query';
import { getWagmiConfig } from '../../../lib/web3/wagmi-config';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { useSelector } from 'react-redux';

const ERC20_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
]);

export const useUserBalances = (
  stakingTokenAddress: string | null,
  rewardsTokenAddress: string | null,
  chainId?: number
) => {
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
      chainId,
    ],
    queryFn: async () => {
      if (!stakingTokenAddress || !userAddress) return null;

      const balance = await readContract(getWagmiConfig(), {
        address: stakingTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
        chainId: chainId || 43113,
      });

      return balance as bigint;
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
      chainId,
    ],
    queryFn: async () => {
      if (!rewardsTokenAddress || !userAddress) return null;

      const balance = await readContract(getWagmiConfig(), {
        address: rewardsTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
        chainId: chainId || 43113,
      });

      return balance as bigint;
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
