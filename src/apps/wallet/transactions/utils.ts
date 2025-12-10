import { Transaction } from '../types';

export function getTransactionTypeLabel(transaction: Transaction): string {
  if (transaction.type === 'token_minting' && transaction.tokenId !== null) {
    return 'NFT Minted';
  }

  return 'Token Transfer';
}
