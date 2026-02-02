import { useMutation } from '@tanstack/react-query';
import { post } from '../../../../lib/api/billing';

export function useCancelZeroProSubscription() {
  const {
    mutateAsync: cancelSubscription,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: async () => {
      try {
        const response = await post('/subscription/cancel');

        if (!response.ok) {
          throw new Error(response.body?.message || 'Failed to cancel subscription');
        }

        return true;
      } catch (error: any) {
        console.error('Failed to cancel subscription:', error);
        throw new Error(error.response?.body?.message || 'Failed to cancel subscription');
      }
    },
  });

  return {
    cancelSubscription,
    isLoading,
    error: error instanceof Error ? error.message : error,
  };
}
