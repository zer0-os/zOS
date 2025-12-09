import { Transaction } from '../types';

export function getTransactionTypeLabel(transaction: Transaction): string {
  const isNFT = transaction.tokenId !== null;

  if (transaction.type === 'token_minting') {
    return isNFT ? 'NFT Minted' : 'Token Minted';
  }

  if (transaction.type === 'token_burning') {
    return 'Token Burned';
  }

  if (transaction.type === 'token_transfer') {
    if (isNFT) {
      return transaction.action === 'send' ? 'NFT Sent' : 'NFT Received';
    }

    return transaction.action === 'send' ? 'Token Transfer' : 'Token Received';
  }

  return 'Transaction';
}
