import { post } from '../../lib/api/rest';

export async function linkThirdwebWallet({ walletAddress }: { walletAddress: string }) {
  try {
    const response = await post('/thirdweb/link-thirdweb-wallet').send({
      walletAddress,
    });

    return {
      success: true,
      wallet: response.body.wallet,
    };
  } catch (error: any) {
    if (error?.response?.status === 400) {
      return {
        success: false,
        response: error.response.body.code,
        error: error.response.body.message,
      };
    }
    throw error;
  }
}
