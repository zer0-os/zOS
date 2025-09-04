import { get } from '../../../lib/api/rest';
import { LeaderboardEntry, LeaderboardParams } from '../components/utils';

export const fetchLeaderboard = async (params: LeaderboardParams = {}): Promise<LeaderboardEntry[]> => {
  const { page = 1, limit = 50, sortBy = 'totalRewards' } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
  });

  const response = await get(`/api/v2/users/leaderboard?${queryParams.toString()}`);

  return response.body;
};
