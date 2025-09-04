import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchLeaderboard } from '../queries/leaderboardQueries';
import { LeaderboardEntry } from '../components/utils';

export const useLeaderboard = () => {
  const result = useInfiniteQuery({
    queryKey: ['leaderboard'],
    queryFn: ({ pageParam = 1 }) =>
      fetchLeaderboard({
        page: pageParam,
        limit: 50,
        sortBy: 'totalRewards',
      }),
    getNextPageParam: (lastPage, allPages) => {
      // If we got a full page (50 items), there might be more
      return lastPage.length === 50 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 0,
    refetchInterval: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Flatten all pages into a single array
  const allEntries: LeaderboardEntry[] = result.data?.pages.flat() ?? [];

  return {
    ...result,
    data: allEntries,
  };
};
