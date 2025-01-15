import { useRouteMatch, useHistory } from 'react-router-dom';

export const usePostRoute = (postId: string) => {
  const history = useHistory();
  const route = useRouteMatch();
  const conversationId = route.params?.conversationId;
  const zid = route.params?.zid;

  const navigateToPost = () => {
    if (conversationId) {
      history.push(`/conversation/${conversationId}/${postId}`);
    } else if (zid) {
      history.push(`/feed/${zid}/${postId}`);
    }
  };

  return {
    route: `/conversation/${conversationId}/${postId}`,
    navigateToPost,
  };
};
