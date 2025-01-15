import { useInfiniteQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { get } from '../../../../../lib/api/rest';
import { PAGE_SIZE } from '../../../lib/constants';
import { RootState } from '../../../../../store';
import { mapPostToMatrixMessage } from '../../../../../store/posts/utils';
import { useMeowPost } from '../../../lib/useMeowPost';

export const useFeed = (zid: string) => {
  const userId = useSelector((state: RootState) => state.authentication.user.data.id);
  const userMeowBalance = useSelector((state: RootState) => state.rewards.meow);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts', { zid }],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await getPosts(zid, { limit: PAGE_SIZE, skip: pageParam * PAGE_SIZE });
      return res.posts?.map((post) => mapPostToMatrixMessage(post));
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!zid,
  });

  const { meowPost } = useMeowPost();

  const hasLoadedMessages = data?.pages.some((page) => page.length > 0);

  const isEmpty = data?.pages.every((page) => page.length === 0);

  return {
    fetchNextPage,
    hasLoadedMessages,
    hasNextPage,
    isEmpty,
    isError,
    isFetchingNextPage,
    isLoading,
    meowPost,
    posts: data,
    userId,
    userMeowBalance,
  };
};

async function getPosts(zid: string, { limit, skip }: { limit: number; skip: number }) {
  const endpoint = `/api/v2/posts/channel/${zid}`;
  const res = await get(endpoint, undefined, { limit, skip, include_replies: true });
  return res.body;
}
