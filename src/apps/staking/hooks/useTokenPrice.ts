import { useQuery } from '@tanstack/react-query';
import { get } from '../../../lib/api/rest';

export const useTokenPrice = (tokenAddress: string, chainId: number) => {
  const network = chainId === 43114 ? 'avalanche' : '';
  return useQuery({
    enabled: !!tokenAddress && !!network,
    queryKey: ['tokenPrice', tokenAddress, network],
    queryFn: async () => {
      const { body } = await get(`/api/tokens/${network}/${tokenAddress}/price`).send();
      return body.usd;
    },
  });
};
