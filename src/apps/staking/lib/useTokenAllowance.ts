import { parseAbi } from 'viem';
import { readContract } from '@wagmi/core';
import { useQuery } from '@tanstack/react-query';
import { getWagmiConfig } from '../../../lib/web3/wagmi-config';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';

const ERC20_ABI = parseAbi([
  'function allowance(address owner, address spender) view returns (uint256)',
]);

export const useTokenAllowance = (tokenAddress: string | null, spenderAddress: string | null, chainId?: number) => {
  const { address: userAddress } = useSelector(selectedWalletSelector);

  const {
    data: allowance,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'tokenAllowance',
      tokenAddress,
      spenderAddress,
      userAddress,
      chainId,
    ],
    queryFn: async () => {
      if (!tokenAddress || !spenderAddress || !userAddress) return null;

      const result = await readContract(getWagmiConfig(), {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [userAddress, spenderAddress as `0x${string}`],
        chainId: chainId || 43113,
      });

      return result as bigint;
    },
    enabled: !!tokenAddress && !!spenderAddress && !!userAddress,
  });

  return {
    allowance,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};
