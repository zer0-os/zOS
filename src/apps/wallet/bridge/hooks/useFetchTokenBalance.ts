import { useQuery } from '@tanstack/react-query';
import { TokenBalance } from '../../types';
import { fetchERC20Balance, fetchNativeBalance } from '../lib/rpc';
import { CURATED_TOKENS } from '../lib/tokens';
import { getCustomTokensForChain } from '../lib/custom-token-storage';

export interface UseFetchTokenBalanceParams {
  chainId: number | undefined;
  walletAddress: string | undefined;
  enabled?: boolean;
}

export function useFetchTokenBalance({ chainId, walletAddress, enabled = true }: UseFetchTokenBalanceParams) {
  return useQuery({
    queryKey: ['tokenBalances', chainId, walletAddress],
    queryFn: async (): Promise<TokenBalance[]> => {
      if (!chainId || !walletAddress) {
        return [];
      }

      const curatedTokens = CURATED_TOKENS[chainId] || [];
      const customTokens = getCustomTokensForChain(chainId);
      const allTokens = [...curatedTokens, ...customTokens];
      const tokenPromises = allTokens.map(async (curatedToken): Promise<TokenBalance> => {
        let balance = '0';
        let symbol = curatedToken.symbol;
        let decimals = curatedToken.decimals;

        if (curatedToken.isNative) {
          // Fetch native balance using eth_getBalance
          try {
            balance = await fetchNativeBalance(chainId, walletAddress);
          } catch (error) {
            console.error(`Error fetching native balance for ${curatedToken.symbol}:`, error);
          }
        } else {
          // Fetch ERC20 balance using eth_call to balanceOf(address)
          try {
            const info = await fetchERC20Balance(chainId, curatedToken.tokenAddress, walletAddress);
            balance = info.balance || '0';
            symbol = info.symbol;
            decimals = info.decimals;
          } catch (error) {
            console.error(`Error fetching balance for ${curatedToken.symbol}:`, error);
          }
        }

        return {
          tokenAddress: curatedToken.tokenAddress,
          symbol,
          name: curatedToken.name,
          amount: balance,
          decimals,
          chainId,
          logo: curatedToken.logo,
        };
      });

      return Promise.all(tokenPromises);
    },
    enabled: enabled && !!chainId && !!walletAddress,
    staleTime: 1000 * 30, // 30 seconds
  });
}
