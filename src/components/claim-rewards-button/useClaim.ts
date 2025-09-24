import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { currentUserSelector } from '../../store/authentication/selectors';
import { User } from '../../store/authentication/types';
import { post } from '../../lib/api/rest';
import { translateClaimError, ClaimRewardsError } from './utils';
import { setUnclaimedRewards, refreshRewards } from '../../store/rewards';

interface ClaimRewardsResponse {
  transactionHash: string;
}

export const useClaim = () => {
  const [showModal, setShowModal] = useState(false);
  const currentUser = useSelector(currentUserSelector) as User | undefined;
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const mutation = useMutation({
    mutationFn: async (): Promise<ClaimRewardsResponse> => {
      setShowModal(true);

      const userThirdWebWalletAddress = currentUser?.zeroWalletAddress;

      if (!userThirdWebWalletAddress) {
        throw new Error('No thirdweb wallet found');
      }

      try {
        const response: ClaimRewardsResponse = await post(`/api/wallet/${userThirdWebWalletAddress}/claim-rewards`);
        return response;
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
      // Invalidate and refetch React Query cache
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });

  const closeModal = () => {
    setShowModal(false);

    // Trigger a fresh fetch of all rewards data to ensure everything is up-to-date
    dispatch(setUnclaimedRewards('0'));
    dispatch(refreshRewards());
  };

  return {
    claimRewards: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error?.message,
    showModal,
    closeModal,
    transactionHash: (mutation as any).data?.body?.transactionHash,
  };
};
