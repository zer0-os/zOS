import { useMutation } from '@tanstack/react-query';
import { billingDelete } from '../../../../lib/api/rest';

export function useCancelZeroProSubscription() {
  const {
    mutateAsync: cancelSubscription,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: async () => {
      try {
        const response = await billingDelete('/subscriptions/zero-pro');

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
