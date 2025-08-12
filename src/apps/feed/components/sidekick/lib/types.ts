export interface TokenPriceData {
  usd: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  lastUpdatedAt: number;
}

export interface TokenInfoResponse {
  tokenAddress: string;
  tokenSymbol: string;
  tokenAmount: string;
  network: string;
  priceData: TokenPriceData;
}

export interface ChannelItem {
  zid: string;
  memberCount?: number;
  tokenSymbol?: string;
  tokenAmount?: string;
  tokenAddress?: string;
  network?: string;
}
