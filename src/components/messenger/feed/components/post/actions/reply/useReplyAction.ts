import { usePostRoute } from '../../lib/usePostRoute';

export const useReplyAction = (postId: string) => {
  const { navigateToPost } = usePostRoute(postId);

  return {
    handleOnClick: navigateToPost,
  };
};
