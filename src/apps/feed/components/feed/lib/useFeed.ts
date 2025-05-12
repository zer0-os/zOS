import { useInfiniteQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { get } from '../../../../../lib/api/rest';
import { PAGE_SIZE } from '../../../lib/constants';
import { mapPostToMatrixMessage } from '../../../../../store/posts/utils';
import { useMeowPost } from '../../../lib/useMeowPost';
import { primaryZIDSelector, userIdSelector } from '../../../../../store/authentication/selectors';
import { userRewardsMeowBalanceSelector } from '../../../../../store/rewards/selectors';

interface UseFeedParams {
  zid?: string;
  userId?: string;
  isLoading?: boolean;
  following?: boolean;
}

export const useFeed = ({ zid, userId, isLoading: isLoadingProp, following }: UseFeedParams) => {
  const currentUserId = useSelector(userIdSelector);
  const userMeowBalance = useSelector(userRewardsMeowBalanceSelector);
  const primaryZID = useSelector(primaryZIDSelector);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts', { zid, userId, following }],
    queryFn: async ({ pageParam = 0 }) => {
      let endpoint;

      if (zid) {
        endpoint = `/api/v2/posts/channel/${zid}`;
      } else {
        endpoint = '/api/v2/posts';
      }

      const params = new URLSearchParams();
      if (userId) {
        params.append('user_id', userId);
      }
      if (following) {
        params.append('following', 'true');
      }

      const queryString = params.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

      const res = await getPosts(fullEndpoint, { limit: PAGE_SIZE, skip: pageParam * PAGE_SIZE });
      return res.posts?.map((post) => mapPostToMatrixMessage(post));
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });

  const { meowPostFeed } = useMeowPost();

  const hasLoadedMessages = !isLoadingProp && data?.pages.some((page) => page.length > 0);

  const isEmpty = data?.pages.every((page) => page.length === 0);

  return {
    channelZid: zid ?? primaryZID,
    fetchNextPage,
    hasLoadedMessages,
    hasNextPage,
    headerText: zid ? `0://${zid}` : 'All',
    isEmpty,
    isError,
    isFetchingNextPage: !isLoadingProp && isFetchingNextPage,
    isLoading: isLoadingProp || isLoading,
    meowPostFeed,
    posts: data,
    currentUserId,
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
