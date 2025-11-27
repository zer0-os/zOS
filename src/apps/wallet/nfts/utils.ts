import { NFT } from '../types';

// Helper function to get explorer base URL
export function getExplorerBaseUrl(): string {
  return 'https://zscan.live';
}

// Helper function to get NFT explorer URL
export function getNFTExplorerUrl(collectionAddress: string, tokenId: string): string {
  const baseUrl = getExplorerBaseUrl();
  return `${baseUrl}/token/${collectionAddress}/instance/${tokenId}`;
}

// Helper function to truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Helper function to determine if NFT is a Zero ID
// Zero IDs have a collectionName set (mapped by the wallet API)
// Non-Zero IDs may have generic collection names like "Mintable NFT" or "Unknown Collection"
export function isZeroID(nft: NFT): boolean {
  if (!nft.collectionName) return false;

  // Filter out generic collection names that indicate non-Zero IDs
  const genericNames = ['mintable nft', 'unknown collection', 'unnamed collection'];
  const collectionNameLower = nft.collectionName.toLowerCase().trim();

  return !genericNames.includes(collectionNameLower);
}
