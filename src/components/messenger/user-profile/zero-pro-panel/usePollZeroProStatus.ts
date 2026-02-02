import React from 'react';
import { get } from '../../../../lib/api/billing';

export function usePollZeroProStatus(
  shouldPoll: boolean,
  onActive: () => void,
  onCancelled: () => void,
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
        if (status === 'active') {
          onActive();
          return;
        }

        if (status === 'cancelled') {
          onCancelled();
          return;
        }

        if (Date.now() - start > timeoutMs) {
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
    onActive,
    onCancelled,
    onTimeout,
    timeoutMs,
  ]);
}
