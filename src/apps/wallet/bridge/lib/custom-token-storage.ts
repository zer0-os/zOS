import { CuratedToken } from './tokens';

const CUSTOM_TOKENS_KEY = 'bridge-custom-tokens';

export interface CustomToken extends CuratedToken {
  chainId: number;
}

export function getCustomTokens(): CustomToken[] {
  try {
    const stored = localStorage.getItem(CUSTOM_TOKENS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getCustomTokensForChain(chainId: number): CustomToken[] {
  return getCustomTokens().filter((token) => token.chainId === chainId);
}

export function addCustomToken(token: CustomToken): void {
  const existing = getCustomTokens();
  const exists = existing.some(
    (t) => t.chainId === token.chainId && t.tokenAddress.toLowerCase() === token.tokenAddress.toLowerCase()
  );
  if (!exists) {
    existing.push(token);
    localStorage.setItem(CUSTOM_TOKENS_KEY, JSON.stringify(existing));
  }
}

export function removeCustomToken(chainId: number, tokenAddress: string): void {
  const existing = getCustomTokens();
  const filtered = existing.filter(
    (t) => !(t.chainId === chainId && t.tokenAddress.toLowerCase() === tokenAddress.toLowerCase())
  );
  localStorage.setItem(CUSTOM_TOKENS_KEY, JSON.stringify(filtered));
}

export function isCustomToken(chainId: number | undefined, tokenAddress: string): boolean {
  if (!chainId) return false;
  const customTokens = getCustomTokensForChain(chainId);
  return customTokens.some((token) => token.tokenAddress.toLowerCase() === tokenAddress.toLowerCase());
}
