import { post } from '../../../lib/api/rest';

export interface TransferTokenResponse {
  transactionHash: string;
}

export const transferTokenRequest = async (
  address: string,
  to: string,
  amount: string,
  tokenAddress: string
): Promise<TransferTokenResponse> => {
  const response = await post(`/api/wallet/${address}/transactions/transfer-token`).send({
    to,
    amount,
    tokenAddress,
  });

  return response.body as TransferTokenResponse;
};
