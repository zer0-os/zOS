import { post } from '../../../lib/api/rest';

export interface TransferNativeAssetResponse {
  transactionHash: string;
}

export const transferNativeAssetRequest = async (
  address: string,
  to: string,
  amount: string,
  chainId: number
): Promise<TransferNativeAssetResponse> => {
  const response = await post(`/api/wallet/${address}/transactions/transfer`).send({
    to,
    amount,
    chainId,
  });

  return response.body as TransferNativeAssetResponse;
};
