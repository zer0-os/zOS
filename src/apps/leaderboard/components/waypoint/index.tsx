import { useEffect, useRef } from 'react';

interface WaypointProps {
  onEnter: () => void;
  rootMargin?: string;
}

export const Waypoint = ({ onEnter, rootMargin = '100px' }: WaypointProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onEnter();
        }
      },
      {
        rootMargin, // Trigger 100px before element becomes visible
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [onEnter, rootMargin]);

  return <div ref={ref} style={{ height: '1px', width: '100%' }} />;
};
