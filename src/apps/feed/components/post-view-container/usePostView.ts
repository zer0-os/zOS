import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getPost, mapPostToMatrixMessage } from '../../../../store/posts/utils';
import { useMeowPost } from '../../lib/useMeowPost';
import { userIdSelector } from '../../../../store/authentication/selectors';
import { useMeowBalance } from '../../lib/useMeowBalance';

export const usePostView = (postId: string) => {
  const userId = useSelector(userIdSelector);
  const { meowBalance: userMeowBalance } = useMeowBalance();
  const { meowPost, meowPostFeed } = useMeowPost();

  const { data, isLoading: isLoadingPost } = useQuery({
    queryKey: ['posts', { postId }],
    queryFn: async () => {
      const res = await getPost(postId);
      return mapPostToMatrixMessage(res.post);
    },
  });

  return {
    isLoadingPost,
    meowPost,
    meowPostFeed,
    post: data,
    userId,
    userMeowBalance,
  };
};
