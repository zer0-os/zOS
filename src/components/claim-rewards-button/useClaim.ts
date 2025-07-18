import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { currentUserSelector } from '../../store/authentication/selectors';
import { User } from '../../store/authentication/types';
import { post } from '../../lib/api/rest';
import { translateClaimError, ClaimRewardsError } from './utils';

interface ClaimRewardsResponse {
  transactionHash: string;
}

export const useClaim = () => {
  const [showModal, setShowModal] = useState(false);
  const currentUser = useSelector(currentUserSelector) as User | undefined;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (): Promise<ClaimRewardsResponse> => {
      setShowModal(true);

      const userThirdWebWalletAddress = currentUser?.wallets?.find((wallet) => wallet.isThirdWeb)?.publicAddress;

      if (!userThirdWebWalletAddress) {
        throw new Error('No thirdweb wallet found');
      }

      try {
        const response = await post(`/api/wallet/${userThirdWebWalletAddress}/claim-rewards`);
        return response.json();
      } catch (error: any) {
        if (error.response && error.response.body) {
          const errorData: ClaimRewardsError = error.response.body;
          const translatedError = translateClaimError(errorData);
          throw new Error(translatedError);
        }

        throw error;
      }
    },
    onSuccess: (_data) => {
      // Invalidate and refetch user data to update rewards balance
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });

  const closeModal = () => {
    setShowModal(false);
  };

  return {
    claimRewards: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error?.message,
    showModal,
    closeModal,
    transactionHash: mutation.data?.transactionHash,
  };
};
