import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TokenBalance } from '../../types';
import { useTokenMetadata } from './useTokenMetadata';
import { addCustomToken } from '../lib/custom-token-storage';

export interface UseTokenSearchParams {
  searchQuery: string;
  tokens: TokenBalance[];
  selectedChainId: number | undefined;
  walletAddress: string | undefined;
}

export function useTokenSearch({ searchQuery, tokens, selectedChainId, walletAddress }: UseTokenSearchParams) {
  const queryClient = useQueryClient();

  // Check if search query is a valid address
  const isAddressQuery = useMemo(() => {
    const trimmed = searchQuery.trim();
    return /^0x[a-fA-F0-9]{40}$/i.test(trimmed);
  }, [searchQuery]);

  // Fetch token metadata if search query is a valid address
  const {
    data: tokenMetadata,
    isPending: isFetchingMetadata,
    error: metadataError,
  } = useTokenMetadata({
    chainId: selectedChainId,
    tokenAddress: isAddressQuery ? searchQuery.trim() : undefined,
    enabled: isAddressQuery && !!selectedChainId,
  });

  // Check if the found token is already in the list
  const foundTokenInList = useMemo(() => {
    if (!isAddressQuery || !tokenMetadata || !selectedChainId) return false;
    return tokens.some(
      (token) =>
        token.tokenAddress.toLowerCase() === searchQuery.trim().toLowerCase() && token.chainId === selectedChainId
    );
  }, [
    isAddressQuery,
    tokenMetadata,
    tokens,
    searchQuery,
    selectedChainId,
  ]);

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens;

    const query = searchQuery.toLowerCase();

    // If searching by address
    if (isAddressQuery) {
      // If token is already in list, filter to show only that token
      if (foundTokenInList) {
        return tokens.filter(
          (token) =>
            token.tokenAddress.toLowerCase() === searchQuery.trim().toLowerCase() && token.chainId === selectedChainId
        );
      }
      // If token not in list and we're searching by address, return empty array
      return [];
    }

    // Normal search by name/symbol/address
    return tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.tokenAddress.toLowerCase().includes(query)
    );
  }, [
    tokens,
    searchQuery,
    isAddressQuery,
    foundTokenInList,
    selectedChainId,
  ]);

  const addTokenToList = async () => {
    if (!selectedChainId || !walletAddress || !tokenMetadata || !isAddressQuery) return;

    const tokenAddress = searchQuery.trim();

    // Add to custom tokens
    addCustomToken({
      tokenAddress,
      symbol: tokenMetadata.symbol,
      name: tokenMetadata.name,
      decimals: tokenMetadata.decimals,
      chainId: selectedChainId,
    });

    // Invalidate and refetch token list to include the new custom token
    queryClient.invalidateQueries({ queryKey: ['tokenBalances', selectedChainId, walletAddress] });

    return tokenAddress;
  };

  return {
    isAddressQuery,
    tokenMetadata,
    isFetchingMetadata,
    metadataError,
    foundTokenInList,
    filteredTokens,
    addTokenToList,
  };
}
