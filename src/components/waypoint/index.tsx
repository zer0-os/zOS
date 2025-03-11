import { useCallback } from 'react';
import { Waypoint as ReactWaypoint } from 'react-waypoint';

export const Waypoint = ({ onEnter, bottomOffset }: { onEnter: () => void; bottomOffset?: string }) => {
  const handleEnter = useCallback(() => {
    requestAnimationFrame(() => {
      onEnter();
    });
  }, [onEnter]);

  return <ReactWaypoint onEnter={handleEnter} bottomOffset={bottomOffset} />;
};
