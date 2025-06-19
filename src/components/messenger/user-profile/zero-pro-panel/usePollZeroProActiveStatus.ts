import React from 'react';

export function usePollZeroProActiveStatus(
  shouldPoll: boolean,
  onActive: () => void,
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
        const res = await fetch('/subscription/status?type=ZERO');
        const data = await res.json();
        const status = data.subscription?.status ?? data.status;
        if (status === 'active') {
          onActive();
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
    onTimeout,
    timeoutMs,
  ]);
}
