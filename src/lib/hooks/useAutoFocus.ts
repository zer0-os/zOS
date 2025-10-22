import { useEffect, RefObject, DependencyList } from 'react';

/**
 * useAutoFocus
 * Queues a focus() call on the given ref whenever the dependencies change.
 * Uses a 0-ms timeout so focus happens after the DOM is stable.
 */
export const useAutoFocus = (ref: RefObject<HTMLElement | null>, deps: DependencyList = []): void => {
  useEffect(() => {
    const timer = setTimeout(() => {
      ref.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
