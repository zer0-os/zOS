import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../../../lib/api/rest';
import { config } from '../../../config';
import { useAccount, useWalletClient } from 'wagmi';
import { useSelector } from 'react-redux';
import { userWalletsSelector } from '../../../store/authentication/selectors';

interface CreateTokenData {
  name: string;
  symbol: string;
  initialBuyAmount: string;
  iconUrl: string;
  description?: string;
}

interface PrepareTokenResponse {
  success: boolean;
  data: {
    transactionData: {
      to: string;
      data: string;
      value: string;
      gasLimit: string;
    };
    name: string;
    symbol: string;
  };
}

interface CompleteTokenResponse {
  success: boolean;
  data: {
    tokenAddress: string;
    transactionHash: string;
    name: string;
    symbol: string;
  };
}

interface CreateTokenError {
  message: string;
  code?: string;
}

export const useCreateZBancToken = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const userWallets = useSelector(userWalletsSelector);

  return useMutation<CompleteTokenResponse, CreateTokenError, CreateTokenData>({
    mutationFn: async (tokenData: CreateTokenData) => {
      if (!address || !walletClient) {
        throw new Error('Please connect your wallet to create tokens.');
      }

      // Get all user's self-custody wallets (non-ThirdWeb wallets)
      const selfCustodyWallets = userWallets?.filter((wallet) => !wallet.isThirdWeb) || [];

      // Check if connected wallet matches any of user's self-custody wallets
      const isUsingCorrectWallet = selfCustodyWallets.some(
        (wallet) => wallet.publicAddress?.toLowerCase() === address.toLowerCase()
      );

      if (!isUsingCorrectWallet) {
        if (selfCustodyWallets.length === 0) {
          throw new Error('No self-custody wallets found. Please link a wallet to your account first.');
        } else {
          throw new Error(
            `Please use one of your ${selfCustodyWallets.length} associated self-custody wallet${
              selfCustodyWallets.length === 1 ? '' : 's'
            } to create tokens.`
          );
        }
      }

      try {
        const prepareResponse = await post('/api/zbanc/create').send({
          ...tokenData,
          chainId: config.zChainId,
        });

        if (!prepareResponse.ok) {
          const errorData = await prepareResponse.json();
          throw new Error(errorData.message || 'Failed to prepare token creation');
        }

        const prepareData: PrepareTokenResponse = prepareResponse.body;

        if (!prepareData.success) {
          throw new Error('Failed to prepare token creation');
        }

        const transactionHash = await walletClient.sendTransaction({
          to: prepareData.data.transactionData.to as `0x${string}`,
          data: prepareData.data.transactionData.data as `0x${string}`,
          value: BigInt(prepareData.data.transactionData.value),
          gas: BigInt(prepareData.data.transactionData.gasLimit),
        } as any);

        const completeResponse = await post('/api/zbanc/complete').send({
          ...tokenData,
          chainId: config.zChainId,
          transactionHash,
        });

        if (!completeResponse.ok) {
          const errorData = await completeResponse.json();
          throw new Error(errorData.message || 'Failed to complete token creation');
        }

        const completeData: CompleteTokenResponse = completeResponse.body;

        if (!completeData.success) {
          throw new Error('Failed to complete token creation');
        }

        return completeData;
      } catch (error: any) {
        console.error('Token creation failed:', error);

        if (error.code === 4001) {
          throw new Error("Transaction was cancelled. Please try again when you're ready.");
        } else if (error.code === -32603) {
          throw new Error('Network error occurred. Please check your connection and try again.');
        } else if (error.code === -32002) {
          throw new Error('Another request is pending. Please check your wallet and try again.');
        } else if (error.message?.includes('insufficient funds')) {
          throw new Error('Insufficient funds for gas fees. Please add more ETH to your wallet.');
        } else if (error.message?.includes('user rejected') || error.message?.includes('User denied')) {
          throw new Error("Transaction was cancelled. Please try again when you're ready.");
        } else if (error.message?.includes('wallet')) {
          throw new Error('Wallet connection issue. Please reconnect your wallet and try again.');
        } else {
          throw new Error(error.message || 'Token creation failed. Please try again.');
        }
      }
    },
    onSuccess: () => {
      // Invalidate the tokens list to refresh with the new token
      queryClient.invalidateQueries({ queryKey: ['zbanc-tokens'] });
    },
  });
};
