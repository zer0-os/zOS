import { useQuery } from '@tanstack/react-query';
import { WalletQueryKeys } from './keys';
import { get } from '../../../lib/api/rest';
import { GetHistoryResponse } from '../types';

export const useTransactionHistoryQuery = (address: string) => {
  return useQuery({
    enabled: !!address,
    queryKey: WalletQueryKeys.transactionHistory(address),
    queryFn: async (): Promise<GetHistoryResponse> => {
      const response = await get(`/api/wallet/${address}/transactions`);
      return response.body;
    },
  });
};
