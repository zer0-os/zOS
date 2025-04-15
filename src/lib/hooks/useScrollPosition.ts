import { useEffect, useRef } from 'react';

export const useScrollPosition = (postId?: string) => {
  const scrollPositionRef = useRef<number>(0);
  const clickedPostIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (postId) {
      scrollPositionRef.current = window.scrollY;
      clickedPostIdRef.current = postId;
    } else if (clickedPostIdRef.current) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);

        const postElement = document.querySelector(`[data-post-id="${clickedPostIdRef.current}"]`);
        if (postElement) {
          postElement.scrollIntoView({
            behavior: 'instant',
            block: 'center',
          });
        }

        clickedPostIdRef.current = null;
      });
    }
  }, [postId]);

  return {
    getScrollPosition: () => scrollPositionRef.current,
    getClickedPostId: () => clickedPostIdRef.current,
  };
};
