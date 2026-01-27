import { useQuery } from '@tanstack/react-query';
import { billingGet } from '../../../../lib/api/rest';

interface Subscription {
  type: string;
  status: string;
  isActive: boolean;
  currentPeriodEnd: string | null;
  subscribedAt: string | null;
  cancelledAt: string | null;
}

interface ZeroProStatusResponse {
  subscription: Subscription | null;
}

export function useStatusZeroProSubscription() {
  return useQuery<ZeroProStatusResponse, Error>({
    queryKey: ['zero-pro-status'],
    queryFn: async () => {
      const response = await billingGet('/subscriptions/me?type=ZERO');

      if (!response.ok) {
        throw new Error(response.body?.message || 'Failed to fetch subscription status');
      }

      return response.body;
    },
    staleTime: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
