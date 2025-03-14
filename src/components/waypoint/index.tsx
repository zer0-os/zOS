import { useCallback } from 'react';
import { Waypoint as ReactWaypoint } from 'react-waypoint';

export const Waypoint = ({
  onEnter,
  onLeave,
  bottomOffset,
}: {
  onEnter: () => void;
  onLeave?: () => void;
  bottomOffset?: string;
}) => {
  const handleEnter = useCallback(() => {
    requestAnimationFrame(() => {
      onEnter();
    });
  }, [onEnter]);

  return <ReactWaypoint onEnter={handleEnter} onLeave={onLeave} bottomOffset={bottomOffset} />;
};
