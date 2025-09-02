import { useQuery } from '@tanstack/react-query';
import { get } from '../../../lib/api/rest';

export interface Achievement {
  name: string;
  description: string;
  effect: string;
}

export interface UseAchievementsParams {
  userId?: string;
}

export const useAchievements = ({ userId }: UseAchievementsParams) => {
  return useQuery({
    queryKey: ['achievements', userId],
    queryFn: async (): Promise<Achievement[]> => {
      if (!userId) {
        return [];
      }

      const response = await get(`/api/v2/users/${userId}/badges`);
      return response.body || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
