import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { startMeasurement, endMeasurement } from '../performance';

/**
 * Hook to measure route change performance
 * This hook will automatically measure the time between route changes
 * and handle cleanup of measurements
 */
export function useRouteChangeMetrics() {
  const location = useLocation();
  const prevLocationRef = useRef(location);

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevLocationRef.current.pathname;

    // Only measure if this is not the initial render
    if (prevPath !== currentPath) {
      const measurementName = `route-change-to-${currentPath}`;

      // End the previous route's measurement if it exists
      try {
        endMeasurement(`route-change-to-${prevPath}`);
      } catch (e) {}

      startMeasurement(measurementName);
    }

    prevLocationRef.current = location;

    return () => {
      try {
        endMeasurement(`route-change-to-${currentPath}`);
      } catch (e) {}
    };
  }, [location]);
}
