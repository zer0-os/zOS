import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';
import { get } from '../../../lib/api/rest';

export const useTokenAllowance = (tokenAddress: string | null, spenderAddress: string | null) => {
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
    ],
    queryFn: async () => {
      const res = await get(`/api/wallet/${userAddress}/token/${tokenAddress}/approval/${spenderAddress}`).send();

      if (!res.ok) {
        throw new Error('Failed to fetch token allowance');
      }

      return res.body;
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
