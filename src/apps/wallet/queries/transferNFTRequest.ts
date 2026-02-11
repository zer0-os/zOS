import { post } from '../../../lib/api/rest';

export interface TransferNFTResponse {
  transactionHash: string;
}

export const transferNFTRequest = async (
  address: string,
  to: string,
  tokenId: string,
  nftAddress: string,
  amount?: string | null,
  tokenType?: string
): Promise<TransferNFTResponse> => {
  const body: Record<string, string> = { to, tokenId, nftAddress };
  if (amount) {
    body.amount = amount;
  }
  if (tokenType) {
    body.tokenType = tokenType;
  }

  const response = await post(`/api/wallet/${address}/transactions/transfer-nft`).send(body);

  return response.body as TransferNFTResponse;
};
