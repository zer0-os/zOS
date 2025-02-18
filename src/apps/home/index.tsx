import { useRouteMatch } from 'react-router-dom';
import { PostView } from '../feed/components/post-view-container';
import { Feed } from '../feed/components/feed';

export const HomeApp = () => {
  const route = useRouteMatch<{ postId: string }>('/home/:postId');
  const postId = route?.params?.postId;

  if (postId) {
    return <PostView postId={postId} hideZidAction={true} isFeed={true} />;
  }

  return <Feed hideZidAction={true} />;
};
