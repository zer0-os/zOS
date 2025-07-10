import { useQuery } from '@tanstack/react-query';
import { WalletQueryKeys } from './keys';
import { get } from '../../../lib/api/rest';
import { GetTokenBalancesResponse } from '../types';

export const useBalancesQuery = (address: string) => {
  return useQuery({
    enabled: !!address,
    queryKey: WalletQueryKeys.balances(address),
    queryFn: async (): Promise<GetTokenBalancesResponse> => {
      const response = await get(`/api/wallet/${address}/tokens`);
      return response.body;
    },
  });
};
