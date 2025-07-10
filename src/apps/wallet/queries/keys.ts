export const WalletQueryKeys = {
  balances: (address: string) => ['balances', address],
  nfts: (address: string) => ['nfts', address],
  transactionHistory: (address: string) => ['transactionHistory', address],
  searchRecipients: (query: string) => ['searchRecipients', query],
  txReceipt: (txHash: string) => ['txReceipt', txHash],
  transferToken: (address: string, to: string, amount: string, tokenAddress: string) => [
    'transferToken',
    address,
    to,
    amount,
    tokenAddress,
  ],
} as const;
