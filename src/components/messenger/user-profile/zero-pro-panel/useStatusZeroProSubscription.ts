import { useQuery } from '@tanstack/react-query';
import { get } from '../../../../lib/api/billing';

interface Subscription {
  status: string;
  type: 'ZERO' | 'WILDER';
  stripeSubscriptionId: string;
  currentPeriodEnd?: Date;
}

interface ZeroProStatusResponse {
  subscription: Subscription | null;
}

export function useStatusZeroProSubscription() {
  return useQuery<ZeroProStatusResponse, Error>({
    queryKey: ['zero-pro-status'],
    queryFn: async () => {
      const response = await get('/subscription/status?type=ZERO');

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
