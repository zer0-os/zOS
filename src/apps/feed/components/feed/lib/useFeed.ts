import { useInfiniteQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { debounce, chunk } from 'lodash';
import { useCallback, useState, useMemo } from 'react';

import { get } from '../../../../../lib/api/rest';
import { PAGE_SIZE } from '../../../lib/constants';
import { mapPostToMatrixMessage } from '../../../../../store/posts/utils';
import { useMeowPost } from '../../../lib/useMeowPost';
import { primaryZIDSelector, userIdSelector, currentUserSelector } from '../../../../../store/authentication/selectors';
import { useMeowBalance } from '../../../lib/useMeowBalance';
import { searchMyNetworksByName } from '../../../../../platform-apps/channels/util/api';
import { MemberNetworks } from '../../../../../store/users/types';
import { queuedPostsByFeedSelector } from '../../../../../store/post-queue/selectors';

interface UseFeedParams {
  zid?: string;
  userId?: string;
  isLoading?: boolean;
  following?: boolean;
}

export const useFeed = ({ zid, userId, isLoading: isLoadingProp, following }: UseFeedParams) => {
  const currentUserId = useSelector(userIdSelector);
  const { meowBalance: userMeowBalance } = useMeowBalance();
  const primaryZID = useSelector(primaryZIDSelector);
  const currentUser = useSelector(currentUserSelector);
  const [searchResults, setSearchResults] = useState<MemberNetworks[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const queuedPosts = useSelector(queuedPostsByFeedSelector(zid));

  const performSearch = useCallback(async (searchText: string) => {
    const usersApiResult = await searchMyNetworksByName(searchText);
    setSearchResults(usersApiResult);
    setIsSearching(false);
  }, []);

  const debouncedSearch = useMemo(() => debounce(performSearch, 800), [performSearch]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (value.trim()) {
        setIsSearching(true);
        debouncedSearch(value);
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    },
    [debouncedSearch]
  );

  const queryKey = ['posts', { zid, userId, ...(typeof following === 'boolean' ? { following } : {}) }];

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey,
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
      if (typeof following === 'boolean') {
        params.append('following', String(following));
      }

      params.append('include_quotes', 'true');

      const queryString = params.toString();
      const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

      const res = await getPosts(fullEndpoint, { limit: PAGE_SIZE, skip: pageParam * PAGE_SIZE });
      return res.posts?.map((post) => mapPostToMatrixMessage(post));
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
    select: (data) => {
      const relevantQueuedPosts = queuedPosts
        .filter((queuedPost) => {
          if (zid) {
            return queuedPost.feedZid === zid;
          }
          return true;
        })
        .map((queuedPost) => queuedPost.optimisticPost);

      const allFetchedPosts = data.pages.flat();

      const allPosts = [...allFetchedPosts, ...relevantQueuedPosts].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      const chunkedPages = chunk(allPosts, PAGE_SIZE);

      return {
        pages: chunkedPages,
        pageParams: data.pageParams,
      };
    },
  });

  const { meowPostFeed } = useMeowPost();

  const hasLoadedMessages = !isLoadingProp && data?.pages.some((page) => page.length > 0);

  const isEmpty = data?.pages.every((page) => page.length === 0);

  return {
    channelZid: zid ?? primaryZID ?? currentUser?.zeroWalletAddress,
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
    searchResults,
    isSearching,
    searchValue,
    handleSearch,
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
