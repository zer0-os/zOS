import { useInfiniteQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { chunk } from 'lodash';

import { PAGE_SIZE } from '../../../lib/constants';
import { getPostReplies, mapPostToMatrixMessage } from '../../../../../store/posts/utils';
import { useMeowPost } from '../../../lib/useMeowPost';
import { userIdSelector } from '../../../../../store/authentication/selectors';
import { userRewardsMeowBalanceSelector } from '../../../../../store/rewards/selectors';
import { queuedCommentsByPostSelector } from '../../../../../store/post-queue/selectors';

export const useReplyList = (postId: string) => {
  const userId = useSelector(userIdSelector);
  const userMeowBalance = useSelector(userRewardsMeowBalanceSelector);
  const { meowPost, meowPostFeed } = useMeowPost();

  const queuedComments = useSelector(queuedCommentsByPostSelector(postId));

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
    select: (data) => {
      const relevantQueuedComments = queuedComments.map((queuedComment) => queuedComment.optimisticPost);

      const allFetchedReplies = data.pages.flat();

      const allReplies = [...allFetchedReplies, ...relevantQueuedComments].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      const chunkedPages = chunk(allReplies, PAGE_SIZE);

      return {
        pages: chunkedPages,
        pageParams: data.pageParams,
      };
    },
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
