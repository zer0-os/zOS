export const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const truncateTokenId = (tokenId: string, maxLength: number = 20) => {
  if (tokenId.length <= maxLength) {
    return tokenId;
  }
  return `${tokenId.slice(0, maxLength)}...`;
};
