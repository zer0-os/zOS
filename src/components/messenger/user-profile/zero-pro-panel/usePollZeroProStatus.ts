import React from 'react';
import { get } from '../../../../lib/api/rest';

export function usePollZeroProStatus(
  shouldPoll: boolean,
  targetStatus: string,
  onSuccess: () => void,
  onTimeout: () => void,
  timeoutMs = 20000
) {
  React.useEffect(() => {
    if (!shouldPoll) return;
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    let start = Date.now();
    async function poll() {
      while (isMounted) {
        const response = await get('/subscription/status?type=ZERO');
        const data = response.body;
        const status = data.subscription?.status ?? data.status;
        const currentPeriodEnd = data.subscription?.currentPeriodEnd;

        // For payment success, wait for both status and currentPeriodEnd
        if (targetStatus === 'active') {
          if (status === targetStatus && currentPeriodEnd) {
            console.log('Payment polling success - status:', status, 'currentPeriodEnd:', currentPeriodEnd);
            onSuccess();
            return;
          }
        } else {
          // For cancellation, just check status
          if (status === targetStatus) {
            console.log('Cancellation polling success - status:', status);
            onSuccess();
            return;
          }
        }

        if (Date.now() - start > timeoutMs) {
          console.log(
            'Polling timeout - targetStatus:',
            targetStatus,
            'currentStatus:',
            status,
            'currentPeriodEnd:',
            currentPeriodEnd
          );
          onTimeout();
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    poll();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [
    shouldPoll,
    targetStatus,
    onSuccess,
    onTimeout,
    timeoutMs,
  ]);
}
