import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getPost } from '../../../../store/posts/utils';
import { mapPostToMatrixMessage } from '../../../../store/posts/utils';
import { RootState } from '../../../../store';
import { useMeowPost } from '../../lib/useMeowPost';

export const usePostView = (postId: string) => {
  const userId = useSelector((state: RootState) => state.authentication.user.data.id);
  const userMeowBalance = useSelector((state: RootState) => state.rewards.meow);
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
