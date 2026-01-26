import { useInfiniteQuery } from '@tanstack/react-query';
import { WalletQueryKeys } from './keys';
import { get } from '../../../lib/api/rest';
import { GetNFTsResponse } from '../types';

type NFTPageParams = GetNFTsResponse['nextPageParams'];

export const useNFTsQuery = (address: string) => {
  const result = useInfiniteQuery({
    enabled: !!address,
    queryKey: WalletQueryKeys.nfts(address),
    queryFn: async ({ pageParam }): Promise<GetNFTsResponse> => {
      const response = await get(`/api/wallet/${address}/nfts`, undefined, pageParam ?? undefined);
      return response.body;
    },
    getNextPageParam: (lastPage): NFTPageParams => lastPage.nextPageParams,
    initialPageParam: null as NFTPageParams,
    staleTime: 1000 * 60 * 3,
  });

  const allNfts = result.data?.pages.flatMap((page) => page.nfts) ?? [];

  return {
    ...result,
    nfts: allNfts,
  };
};
