import { useLocation, useRouteMatch } from 'react-router-dom';
import { UserPanel } from './panels/UserPanel';
import { Switcher } from './panels/Switcher';
import { PostView } from '../feed/components/post-view-container';
import { useEffect } from 'react';
import {
  useReturnFromProfileNavigation,
  RETURN_POST_ID_KEY,
  RETURN_PATH_KEY,
} from '../feed/lib/useReturnFromProfileNavigation';

import styles from './styles.module.scss';

export const ProfileApp = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const returnPostId = searchParams.get(RETURN_POST_ID_KEY);
  const returnPath = searchParams.get(RETURN_PATH_KEY);
  const { storeReturnFromProfileData } = useReturnFromProfileNavigation();

  useEffect(() => {
    if (returnPostId && returnPath) {
      storeReturnFromProfileData(returnPostId, returnPath);
    }
  }, [returnPostId, returnPath, storeReturnFromProfileData]);

  const route = useRouteMatch<{ zid: string; postId?: string }>('/profile/:zid/:postId?');
  const postId = route?.params?.postId;

  return (
    <div className={styles.Wrapper}>
      {postId ? (
        <PostView postId={postId} isFeed={true} />
      ) : (
        <>
          <Switcher />
          <div>
            <UserPanel />
          </div>
        </>
      )}
    </div>
  );
};
