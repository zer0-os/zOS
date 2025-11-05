export interface BridgeParams {
  tokenAddress: string;
  amount: string;
  fromChainId: number;
  toChainId: number;
}

export const CHAIN_ID_ETHEREUM = 1;
export const CHAIN_ID_SEPOLIA = 11155111;
export const CHAIN_ID_ZCHAIN = 9369;
export const CHAIN_ID_ZEPHYR = 1417429182;

export const L1_CHAIN_IDS = [CHAIN_ID_ETHEREUM, CHAIN_ID_SEPOLIA] as const;
export const L2_CHAIN_IDS = [CHAIN_ID_ZCHAIN, CHAIN_ID_ZEPHYR] as const;

export const CHAIN_NAMES: Record<number, string> = {
  [CHAIN_ID_ETHEREUM]: 'Ethereum',
  [CHAIN_ID_SEPOLIA]: 'Sepolia',
  [CHAIN_ID_ZCHAIN]: 'Z Chain',
  [CHAIN_ID_ZEPHYR]: 'Zephyr',
};

export const RPC_URLS: Record<number, string> = {
  [CHAIN_ID_ETHEREUM]: 'https://rpc.eu-central-1.gateway.fm/v4/ethereum/non-archival/mainnet',
  [CHAIN_ID_SEPOLIA]: 'https://rpc.eu-central-1.gateway.fm/v4/ethereum/non-archival/sepolia',
  [CHAIN_ID_ZCHAIN]: 'https://rpc.zchain.org',
  [CHAIN_ID_ZEPHYR]: 'https://zephyr-rpc.eu-north-2.gateway.fm/',
};

export function getRpcUrl(chainId: number): string | undefined {
  return RPC_URLS[chainId];
}

// Zero address constant
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function formatAmount(amount: string): string {
  if (!amount || amount === '0') {
    return '0.0';
  }

  let formatted = amount.replace(/\.?0+$/, '');

  if (!formatted || formatted === '.') {
    return '0.0';
  }

  if (formatted.endsWith('.')) {
    formatted = formatted.slice(0, -1);
  }

  if (!formatted || formatted === '0') {
    return '0.0';
  }

  return formatted;
}

export function getDestinationChainId(fromChainId: number): number {
  if (fromChainId === CHAIN_ID_ETHEREUM) {
    return CHAIN_ID_ZCHAIN; // Ethereum -> ZChain
  } else if (fromChainId === CHAIN_ID_ZCHAIN) {
    return CHAIN_ID_ETHEREUM; // ZChain -> Ethereum
  } else if (fromChainId === CHAIN_ID_SEPOLIA) {
    return CHAIN_ID_ZEPHYR; // Sepolia -> Zephyr
  } else if (fromChainId === CHAIN_ID_ZEPHYR) {
    return CHAIN_ID_SEPOLIA; // Zephyr -> Sepolia
  }
  throw new Error(`Unsupported chain ID: ${fromChainId}`);
}

export function getOriginNetworkId(fromChainId: number): number {
  if (fromChainId === CHAIN_ID_ETHEREUM) {
    return 0; // Ethereum
  } else if (fromChainId === CHAIN_ID_ZCHAIN) {
    return 1; // ZChain
  } else if (fromChainId === CHAIN_ID_SEPOLIA) {
    return 0; // Sepolia
  } else if (fromChainId === CHAIN_ID_ZEPHYR) {
    return 1; // Zephyr
  }
  throw new Error(`Unsupported chain ID: ${fromChainId}`);
}

export const SUPPORTED_L1_CHAINS = [CHAIN_ID_ETHEREUM, CHAIN_ID_SEPOLIA] as const;

export function isSupportedBridgeChain(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return SUPPORTED_L1_CHAINS.includes(chainId as any);
}

export function getL2ChainForL1(l1ChainId: number): number {
  if (l1ChainId === CHAIN_ID_ETHEREUM) {
    return CHAIN_ID_ZCHAIN;
  } else if (l1ChainId === CHAIN_ID_SEPOLIA) {
    return CHAIN_ID_ZEPHYR;
  }
  throw new Error(`Unsupported L1 chain ID: ${l1ChainId}`);
}

export function getL1ChainForL2(l2ChainId: number): number {
  if (l2ChainId === CHAIN_ID_ZCHAIN) {
    return CHAIN_ID_ETHEREUM;
  } else if (l2ChainId === CHAIN_ID_ZEPHYR) {
    return CHAIN_ID_SEPOLIA;
  }
  throw new Error(`Unsupported L2 chain ID: ${l2ChainId}`);
}

export interface AvailableChain {
  id: string;
  name: string;
  chainId: number;
}

export function getAvailableChainsForBridge(connectedChainId: number | undefined): AvailableChain[] {
  if (!connectedChainId) return [];

  // If connected to mainnet, show Ethereum and ZChain
  if (connectedChainId === CHAIN_ID_ETHEREUM) {
    return [
      { id: 'ethereum', name: CHAIN_NAMES[CHAIN_ID_ETHEREUM], chainId: CHAIN_ID_ETHEREUM },
      { id: 'zchain', name: CHAIN_NAMES[CHAIN_ID_ZCHAIN], chainId: CHAIN_ID_ZCHAIN },
    ];
  }
  // If connected to Sepolia, show Sepolia and Zephyr
  if (connectedChainId === CHAIN_ID_SEPOLIA) {
    return [
      { id: 'sepolia', name: CHAIN_NAMES[CHAIN_ID_SEPOLIA], chainId: CHAIN_ID_SEPOLIA },
      { id: 'zephyr', name: CHAIN_NAMES[CHAIN_ID_ZEPHYR], chainId: CHAIN_ID_ZEPHYR },
    ];
  }
  // If connected to L2, show both chains in that pair
  if (connectedChainId === CHAIN_ID_ZCHAIN) {
    return [
      { id: 'ethereum', name: CHAIN_NAMES[CHAIN_ID_ETHEREUM], chainId: CHAIN_ID_ETHEREUM },
      { id: 'zchain', name: CHAIN_NAMES[CHAIN_ID_ZCHAIN], chainId: CHAIN_ID_ZCHAIN },
    ];
  }
  if (connectedChainId === CHAIN_ID_ZEPHYR) {
    return [
      { id: 'sepolia', name: CHAIN_NAMES[CHAIN_ID_SEPOLIA], chainId: CHAIN_ID_SEPOLIA },
      { id: 'zephyr', name: CHAIN_NAMES[CHAIN_ID_ZEPHYR], chainId: CHAIN_ID_ZEPHYR },
    ];
  }
  // Default fallback (shouldn't happen if chain validation is working)
  return [
    { id: 'ethereum', name: CHAIN_NAMES[CHAIN_ID_ETHEREUM], chainId: CHAIN_ID_ETHEREUM },
    { id: 'zchain', name: CHAIN_NAMES[CHAIN_ID_ZCHAIN], chainId: CHAIN_ID_ZCHAIN },
  ];
}

export function formatAddress(address: string | undefined): string {
  if (!address || address === ZERO_ADDRESS) {
    return '0x0000...0000';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getExplorerAddressUrl(address: string, chainId: number): string {
  const explorerUrls: Record<number, string> = {
    [CHAIN_ID_ETHEREUM]: 'https://etherscan.io/address/',
    [CHAIN_ID_SEPOLIA]: 'https://sepolia.etherscan.io/address/',
    [CHAIN_ID_ZCHAIN]: 'https://zscan.live/address/',
    [CHAIN_ID_ZEPHYR]: 'https://zephyr-blockscout.eu-north-2.gateway.fm/address/',
  };
  const baseUrl = explorerUrls[chainId] || '';
  return baseUrl ? `${baseUrl}${address}` : '';
}

export function getWalletAddressForChain(
  chainId: number | undefined,
  eoaAddress: string | undefined,
  zeroWalletAddress: string | undefined
): string | undefined {
  if (!chainId) return undefined;
  if (L1_CHAIN_IDS.includes(chainId as any)) {
    return eoaAddress;
  }
  if (L2_CHAIN_IDS.includes(chainId as any)) {
    return zeroWalletAddress;
  }
  return eoaAddress; // Default to EOA
}

export function isL1Chain(chainId: number): boolean {
  return L1_CHAIN_IDS.includes(chainId as any);
}

export function isL2Chain(chainId: number): boolean {
  return L2_CHAIN_IDS.includes(chainId as any);
}

export interface TokenInfo {
  chainId: number;
  tokenAddress?: string;
}

export interface L1L2TokenInfo {
  l1Address?: string;
  l2Address?: string;
  l1ChainId: number;
  l2ChainId: number;
}

export function getL1L2TokenInfo(fromToken: TokenInfo | null, toToken: TokenInfo | null): L1L2TokenInfo | null {
  if (!fromToken || !toToken) return null;

  const fromIsL1 = isL1Chain(fromToken.chainId);
  const fromIsL2 = isL2Chain(fromToken.chainId);

  if (fromIsL1) {
    return {
      l1Address: fromToken.tokenAddress,
      l2Address: toToken.tokenAddress,
      l1ChainId: fromToken.chainId,
      l2ChainId: toToken.chainId,
    };
  }

  if (fromIsL2) {
    return {
      l1Address: toToken.tokenAddress,
      l2Address: fromToken.tokenAddress,
      l1ChainId: toToken.chainId,
      l2ChainId: fromToken.chainId,
    };
  }

  // Fallback: assume fromToken is L1 if neither check passes
  return {
    l1Address: fromToken.tokenAddress,
    l2Address: toToken.tokenAddress,
    l1ChainId: fromToken.chainId,
    l2ChainId: toToken.chainId,
  };
}

export type BridgeValidationError =
  | 'NO_FROM_TOKEN'
  | 'NO_TO_TOKEN'
  | 'SAME_CHAIN'
  | 'INVALID_AMOUNT'
  | 'NO_TOKEN_ADDRESS'
  | 'INSUFFICIENT_BALANCE'
  | null;

export function getBridgeValidationError(
  fromChainId: number | null | undefined,
  toChainId: number | null | undefined,
  amount: string | null | undefined,
  tokenAddress: string | null | undefined,
  tokenBalance: string | null | undefined
): BridgeValidationError {
  if (!fromChainId) return 'NO_FROM_TOKEN';
  if (!toChainId) return 'NO_TO_TOKEN';
  if (fromChainId === toChainId) return 'SAME_CHAIN';
  if (!tokenAddress) return 'NO_TOKEN_ADDRESS';

  // Check if user has balance for the token
  const balance = tokenBalance ? Number(tokenBalance) : 0;
  if (balance <= 0) return 'INSUFFICIENT_BALANCE';

  if (!amount || Number(amount) <= 0) return 'INVALID_AMOUNT';
  return null;
}

export function getBridgeValidationErrorMessage(error: BridgeValidationError): string {
  switch (error) {
    case 'NO_FROM_TOKEN':
      return 'Please select a token to bridge';
    case 'NO_TO_TOKEN':
      return 'Error fetching bridge counterpart token information';
    case 'SAME_CHAIN':
      return 'Cannot bridge to the same chain';
    case 'INVALID_AMOUNT':
      return 'Please enter a valid amount greater than 0';
    case 'NO_TOKEN_ADDRESS':
      return 'Token address is required';
    case 'INSUFFICIENT_BALANCE':
      return 'You do not have a balance for the selected token';
    default:
      return '';
  }
}
