import { useRouteMatch, useHistory } from 'react-router-dom';

export const usePostRoute = (postId: string) => {
  const history = useHistory();
  const route = useRouteMatch();
  const conversationId = route.params?.conversationId;

  const navigateToPost = () => {
    history.push(`/conversation/${conversationId}/${postId}`);
  };

  return {
    route: `/conversation/${conversationId}/${postId}`,
    navigateToPost,
  };
};
