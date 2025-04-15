import { useRouteMatch } from 'react-router-dom';
import { PostView } from '../feed/components/post-view-container';
import { Feed } from '../feed/components/feed';
import { useScrollPosition } from '../../lib/hooks/useScrollPosition';

import styles from './styles.module.scss';

export const HomeApp = () => {
  const route = useRouteMatch<{ postId: string }>('/home/:postId');
  const postId = route?.params?.postId;
  useScrollPosition(postId);

  if (postId) {
    return (
      <div className={styles.Home}>
        <PostView postId={postId} isFeed={true} />
      </div>
    );
  }

  return (
    <div className={styles.Home}>
      <Feed />
    </div>
  );
};
