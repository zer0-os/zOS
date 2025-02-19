import { useRouteMatch, useHistory } from 'react-router-dom';

export const usePostRoute = (postId: string, channelZid?: string) => {
  const history = useHistory();
  const route = useRouteMatch();
  const conversationId = route.params?.conversationId;
  const routeZid = route.params?.zid;
  const isHome = route.path?.startsWith('/home');

  const navigateToPost = () => {
    if (conversationId) {
      history.push(`/conversation/${conversationId}/${postId}`);
    } else if (isHome) {
      history.push(`/home/${postId}`);
    } else {
      history.push(`/feed/${channelZid ?? routeZid}/${postId}`);
    }
  };

  return {
    route: `/conversation/${conversationId}/${postId}`,
    navigateToPost,
  };
};
