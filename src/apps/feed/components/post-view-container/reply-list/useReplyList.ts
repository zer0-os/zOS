import { useInfiniteQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { PAGE_SIZE } from '../../../lib/constants';
import { RootState } from '../../../../../store';
import { getPostReplies, mapPostToMatrixMessage } from '../../../../../store/posts/utils';
import { useMeowPost } from '../../../lib/useMeowPost';

export const useReplyList = (postId: string) => {
  const userId = useSelector((state: RootState) => state.authentication.user.data.id);
  const userMeowBalance = useSelector((state: RootState) => state.rewards.meow);
  const { meowPost, meowPostFeed } = useMeowPost();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts', 'replies', { postId }],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await getPostReplies(postId, { limit: PAGE_SIZE, skip: pageParam * PAGE_SIZE });
      return res.replies?.map((reply) => mapPostToMatrixMessage(reply));
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });

  return {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    replies: data,
    userId,
    userMeowBalance,
    meowPost,
    meowPostFeed,
  };
};
