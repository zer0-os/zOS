import { queryOptions } from '@tanstack/react-query';
import { get } from '../../../lib/api/rest';
import { WalletQueryKeys } from './keys';

export interface TxReceiptResponse {
  status: string;
  blockExplorerUrl: string;
  transactionHash: string;
}

export const txReceiptQueryOptions = (txHash: string, chainId: number) => {
  return queryOptions({
    queryKey: WalletQueryKeys.txReceipt(txHash, chainId),
    queryFn: async (): Promise<TxReceiptResponse> => {
      const response = await get(`/api/wallet/transaction/${txHash}/receipt?chainId=${chainId}`);

      return response.body as TxReceiptResponse;
    },
  });
};
