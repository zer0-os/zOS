import { useHistory, useRouteMatch } from 'react-router-dom';

export const useReplyAction = (postId: string) => {
  const history = useHistory();
  const route = useRouteMatch();

  const handleOnClick = () => {
    const params = route.params;
    const { conversationId } = params;
    history.push(`/conversation/${conversationId}/${postId}`);
  };

  return {
    handleOnClick,
  };
};
