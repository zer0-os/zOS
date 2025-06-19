import { useQuery } from '@tanstack/react-query';

interface Subscription {
  status: string;
  type: 'ZERO' | 'WILDER';
  stripeSubscriptionId: string;
  currentPeriodEnd?: Date;
}

interface ZeroProStatusResponse {
  subscription: Subscription | null; // null when no subscription exists
}

export function useZeroProStatus() {
  return useQuery<ZeroProStatusResponse, Error>({
    queryKey: ['zero-pro-status'],
    queryFn: async () => {
      const res = await fetch('/subscription/status?type=ZERO');
      if (!res.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      return res.json();
    },
    staleTime: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function isActiveSubscription(data: ZeroProStatusResponse | undefined): boolean {
  return data?.subscription?.status === 'active';
}
