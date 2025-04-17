import { useRouteMatch } from 'react-router-dom';
import { UserPanel } from './panels/UserPanel';
import { Switcher } from './panels/Switcher';
import { PostView } from '../feed/components/post-view-container';

import styles from './styles.module.scss';

export const ProfileApp = () => {
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
