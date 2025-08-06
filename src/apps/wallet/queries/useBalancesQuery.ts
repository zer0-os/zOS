import { useQuery } from '@tanstack/react-query';
import { WalletQueryKeys } from './keys';
import { get } from '../../../lib/api/rest';
import { GetTokenBalancesResponse, TokenBalance } from '../types';
import { MEOW_TOKEN_ADDRESS, VMEOW_TOKEN_ADDRESS } from '../constants';
import { meowInUSDSelector, meowPercentChangeSelector } from '../../../store/rewards/selectors';
import { useSelector } from 'react-redux';

export const useBalancesQuery = (address: string) => {
  const meowPercentChange = useSelector(meowPercentChangeSelector);
  const meowPrice = useSelector(meowInUSDSelector);

  const result = useQuery({
    enabled: !!address,
    queryKey: WalletQueryKeys.balances(address),
    queryFn: async (): Promise<GetTokenBalancesResponse> => {
      const response = await get(`/api/wallet/${address}/tokens`);
      const body = response.body;
      await preloadImages(body?.tokens ?? []);
      return body;
    },
  });

  const tokens = result.data?.tokens.map((token: TokenBalance) => {
    if (token.tokenAddress === MEOW_TOKEN_ADDRESS || token.tokenAddress === VMEOW_TOKEN_ADDRESS) {
      return {
        ...token,
        price: meowPrice,
        percentChange: meowPercentChange,
      };
    }
    return token;
  });

  return {
    ...result,
    data: {
      ...result.data,
      tokens,
    },
  };
};

async function preloadImages(tokens: TokenBalance[]) {
  const promises = tokens
    .filter((token) => token.logo)
    .map((token) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = token.logo!;
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

  await Promise.allSettled(promises);
}
