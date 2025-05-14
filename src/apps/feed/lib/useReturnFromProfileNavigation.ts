import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const RETURN_DATA_KEY = 'profileReturnData';
export const RETURN_POST_ID_KEY = 'returnPostId';
export const RETURN_PATH_KEY = 'returnPath';

interface ReturnData {
  postId: string;
  path: string;
}

export const useReturnFromProfileNavigation = (postId?: string) => {
  const location = useLocation();

  // Handle scrolling to post when returning
  useEffect(() => {
    // If we have a postId in the URL, we're already at the post
    if (postId) return;

    const storedData = sessionStorage.getItem(RETURN_DATA_KEY);
    if (!storedData) return;

    try {
      const { postId: returnPostId, path: returnPath } = JSON.parse(storedData);

      // If we're on the return path and have a post ID, scroll to it
      if (returnPath === location.pathname && returnPostId) {
        const postElement = document.querySelector(`[data-post-id="${returnPostId}"]`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      }
    } catch (error) {
      console.error('Error handling return data:', error);
    }
  }, [postId, location.pathname]);

  // Store return data when navigating to profile
  const storeReturnFromProfileData = (returnPostId: string, returnPath: string) => {
    if (returnPostId && returnPath) {
      const returnData: ReturnData = {
        postId: returnPostId,
        path: returnPath,
      };
      sessionStorage.setItem(RETURN_DATA_KEY, JSON.stringify(returnData));
    }
  };

  return {
    storeReturnFromProfileData,
  };
};
