// ZBanc API Response Types
export interface ZBancToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  graduated: boolean;
  isActive: boolean;
  asset: {
    symbol: string;
    address: string;
  };
  fees: {
    vaultEntryFee: number;
    vaultExitFee: number;
    protocolEntryFee: number;
    protocolExitFee: number;
    protocolFeeRecipient: string;
  };
  iconUrl?: string;
  description?: string;
  creatorAddress: string;
  creatorUserId: string;
}

// Display format for DexTable
export interface TokenData {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  pair: string;
  description?: string;
  price: number;
  totalSupply: string;
  change24h: number;
  status: 'Active' | 'Graduated' | 'Inactive';
  address: string;
  iconUrl?: string;
}

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

export type SortKey = 'rank' | 'price' | 'totalSupply' | 'change24h' | 'status';

// Formatting
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(6)}`;
};

export const formatTotalSupply = (totalSupply: string, decimals: number = 18): string => {
  const num = parseFloat(totalSupply) / Math.pow(10, decimals);
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
};

export const formatChange = (change: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

// Status determination
export const getTokenStatus = (token: ZBancToken): 'Active' | 'Graduated' | 'Inactive' => {
  if (token.graduated) return 'Graduated';
  if (token.isActive) return 'Active';
  return 'Inactive';
};

// Sorting
export const handleSort = (currentSort: SortConfig, newKey: SortKey): SortConfig => {
  if (currentSort.key === newKey) {
    if (currentSort.direction === 'desc') {
      return { key: newKey, direction: 'asc' };
    } else if (currentSort.direction === 'asc') {
      return { key: null, direction: null };
    }
  }
  return { key: newKey, direction: 'desc' };
};

export const sortTokens = (tokens: TokenData[], sortConfig: SortConfig): TokenData[] => {
  if (!tokens || !sortConfig.key || !sortConfig.direction) {
    return tokens;
  }

  return [...tokens].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortConfig.key) {
      case 'rank':
        aValue = a.rank;
        bValue = b.rank;
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'totalSupply':
        aValue = parseFloat(a.totalSupply);
        bValue = parseFloat(b.totalSupply);
        break;
      case 'change24h':
        aValue = a.change24h;
        bValue = b.change24h;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }

    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

// Convert ZBanc API response to TokenData format
export const convertZBancToTokenData = (zbancTokens: ZBancToken[]): TokenData[] => {
  const convertedTokens = zbancTokens.map((token, index) => ({
    id: token.address,
    rank: index + 1,
    name: token.name,
    symbol: token.symbol,
    pair: `${token.symbol}/${token.asset.symbol}`,
    description: token.description || `ZBanc token - ${token.graduated ? 'Graduated' : 'Active'}`,
    price: 0.001, // Mock price for now - will be replaced with real data later
    totalSupply: token.totalSupply,
    change24h: Math.random() * 20 - 10, // Mock change for now
    status: getTokenStatus(token),
    address: token.address,
    iconUrl: token.iconUrl,
  }));

  return convertedTokens;
};
