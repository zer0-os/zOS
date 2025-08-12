export const formatTokenPrice = (price: number): string => {
  return `$${price >= 1 ? price.toFixed(2) : price.toFixed(6)}`;
};

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  }
  if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  }
  if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toFixed(2)}K`;
  }
  return `$${marketCap.toFixed(0)}`;
};

export const formatPriceChange = (change: number): string => {
  const sign = change >= 0 ? '' : '-';
  return `${sign}${change.toFixed(2)}%`;
};
