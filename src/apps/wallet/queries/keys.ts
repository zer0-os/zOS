export const WalletQueryKeys = {
  balances: (address: string) => ['balances', address],
  nfts: (address: string) => ['nfts', address],
  transactionHistory: (address: string) => ['transactionHistory', address],
  searchRecipients: (query: string) => ['searchRecipients', query],
  txReceipt: (txHash: string, chainId: number) => ['txReceipt', txHash, chainId],
  transferToken: (address: string, to: string, amount: string, tokenAddress: string, chainId: number) => [
    'transferToken',
    address,
    to,
    amount,
    tokenAddress,
    chainId,
  ],
  transferNativeAsset: (address: string, to: string, amount: string, chainId: number) => [
    'transferNativeAsset',
    address,
    to,
    amount,
    chainId,
  ],
} as const;
