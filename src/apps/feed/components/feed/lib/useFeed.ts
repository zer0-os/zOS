import { useInfiniteQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { get } from '../../../../../lib/api/rest';
import { PAGE_SIZE } from '../../../lib/constants';
import { RootState } from '../../../../../store';
import { mapPostToMatrixMessage } from '../../../../../store/posts/utils';
import { useMeowPost } from '../../../lib/useMeowPost';

export const useFeed = (zid?: string) => {
  const userId = useSelector((state: RootState) => state.authentication.user.data.id);
  const userMeowBalance = useSelector((state: RootState) => state.rewards.meow);
  const primaryZID = useSelector((state: RootState) => state.authentication.user.data.primaryZID)?.replace('0://', '');

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts', { zid }],
    queryFn: async ({ pageParam = 0 }) => {
      let endpoint;

      if (zid) {
        endpoint = `/api/v2/posts/channel/${zid}`;
      } else {
        endpoint = '/api/v2/posts';
      }

      const res = await getPosts(endpoint, { limit: PAGE_SIZE, skip: pageParam * PAGE_SIZE });
      return res.posts?.map((post) => mapPostToMatrixMessage(post));
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });

  const { meowPostFeed } = useMeowPost();

  const hasLoadedMessages = data?.pages.some((page) => page.length > 0);

  const isEmpty = data?.pages.every((page) => page.length === 0);

  return {
    channelZid: zid ?? primaryZID,
    fetchNextPage,
    hasLoadedMessages,
    hasNextPage,
    headerText: zid ? `0://${zid}` : 'All',
    isEmpty,
    isError,
    isFetchingNextPage,
    isLoading,
    meowPostFeed,
    posts: data,
    userId,
    userMeowBalance,
  };
};

interface Options {
  limit: number;
  skip: number;
}

async function getPosts(endpoint: string, options: Options) {
  const res = await get(endpoint, undefined, { ...options, include_replies: true, include_meows: true });
  return res.body;
}
