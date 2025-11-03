export interface BridgeParams {
  tokenAddress: string;
  amount: string;
  fromChainId: number;
  toChainId: number;
}

export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  11155111: 'Sepolia',
  9369: 'ZChain',
  1417429182: 'Zephyr',
};

export function isBridgeValid(
  fromChainId: number | null | undefined,
  toChainId: number | null | undefined,
  amount: string | null | undefined,
  tokenAddress: string | null | undefined
): boolean {
  if (!fromChainId || !toChainId) return false;
  if (fromChainId === toChainId) return false;
  if (!amount || Number(amount) <= 0) return false;
  if (!tokenAddress) return false;

  return true;
}
