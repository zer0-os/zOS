export interface TokenData {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  pair: string;
  description?: string;
  price: number;
  volume: number;
  change24h: number;
  age: string;
  txns: number;
  makers: number;
}

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

export type SortKey = 'rank' | 'price' | 'volume' | 'change24h';

// Formatting
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(6)}`;
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(1)}M`;
  }
  return `$${(volume / 1000).toFixed(0)}K`;
};

export const formatChange = (change: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
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
    let aValue: number;
    let bValue: number;

    switch (sortConfig.key) {
      case 'rank':
        aValue = a.rank;
        bValue = b.rank;
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'volume':
        aValue = a.volume;
        bValue = b.volume;
        break;
      case 'change24h':
        aValue = a.change24h;
        bValue = b.change24h;
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
