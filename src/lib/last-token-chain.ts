const LAST_TOKEN_CHAIN_KEY = 'last-active-token-chain';

export const setLastActiveTokenChain = (chainId: string): void => {
  if (chainId) {
    localStorage.setItem(LAST_TOKEN_CHAIN_KEY, chainId);
  }
};

export const getLastActiveTokenChain = (): string | null => {
  return localStorage.getItem(LAST_TOKEN_CHAIN_KEY);
};

export const clearLastActiveTokenChain = (): void => {
  localStorage.removeItem(LAST_TOKEN_CHAIN_KEY);
};
