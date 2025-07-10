import { post } from '../../../lib/api/rest';

export interface TransferNFTResponse {
  transactionHash: string;
}

export const transferNFTRequest = async (
  address: string,
  to: string,
  tokenId: string,
  nftAddress: string
): Promise<TransferNFTResponse> => {
  const response = await post(`/api/wallet/${address}/transactions/transfer-nft`).send({
    to,
    tokenId,
    nftAddress,
  });

  return response.body as TransferNFTResponse;
};
