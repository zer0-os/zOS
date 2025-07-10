import { useQuery } from '@tanstack/react-query';
import { WalletQueryKeys } from './keys';
import { get } from '../../../lib/api/rest';
import { GetNFTsResponse } from '../types';

export const useNFTsQuery = (address: string) => {
  return useQuery({
    enabled: !!address,
    queryKey: WalletQueryKeys.nfts(address),
    queryFn: async (): Promise<GetNFTsResponse> => {
      const response = await get(`/api/wallet/${address}/nfts`);
      return response.body;
    },
  });
};
