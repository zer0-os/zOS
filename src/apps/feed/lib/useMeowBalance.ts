import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { get } from '../../../lib/api/rest';
import { selectedWalletAddressSelector } from '../../../store/wallet/selectors';
import { MEOW_TOKEN_ADDRESS } from '../../wallet/constants';

/**
 * Hook to fetch user's MEOW token balance from their Z-chain wallet
 */
export const useMeowBalance = () => {
  const userAddress = useSelector(selectedWalletAddressSelector);

  const {
    data: meowBalance,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['meowBalance', userAddress, MEOW_TOKEN_ADDRESS],
    queryFn: async (): Promise<string> => {
      if (!userAddress) return '0';

      const response = await get(`/api/wallet/${userAddress}/token/${MEOW_TOKEN_ADDRESS}/balance`).send();

      console.log('response : ', response);

      if (!response.ok) {
        throw new Error('Failed to fetch MEOW token balance');
      }

      return response.body.balance || '0';
    },
    enabled: !!userAddress,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: 5 * 60 * 1000,
  });

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      meowBalance: meowBalance || '0',
      isLoading,
      error: error?.message || null,
      refetch, // Manual refresh for transactions or explicit user actions
    }),
    [
      meowBalance,
      isLoading,
      error,
      refetch,
    ]
  );
};
