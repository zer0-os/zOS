import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { getFollowStatus, followUser, unfollowUser } from '../../../store/user-follows/api';
import { addFollowing, removeFollowing } from '../../../store/user-follows';
import { RootState } from '../../../store/reducer';

const followingSelector = (state: RootState) => state.userFollows.following;

export const useFollow = (targetUserId?: string) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const following = useSelector(followingSelector);

  const { data: isFollowingFromApi, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['followStatus', targetUserId],
    queryFn: () => getFollowStatus(targetUserId),
    staleTime: 0,
    enabled: !!targetUserId,
  });

  const followMutation = useMutation({
    mutationFn: () => {
      if (targetUserId) {
        return followUser(targetUserId);
      } else {
        throw new Error('Target user ID is required');
      }
    },
    onSuccess: async () => {
      dispatch(addFollowing(targetUserId));

      // Refetch all relevant data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['followStatus', targetUserId] }),
        // Invalidate both the target user's and current user's follow lists
        queryClient.invalidateQueries({ queryKey: ['followList', targetUserId, 'followers'] }),
        queryClient.invalidateQueries({ queryKey: ['followList', targetUserId, 'following'] }),
      ]);
    },
    onError: (error) => {
      console.error('Follow action failed:', error);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => {
      if (targetUserId) {
        return unfollowUser(targetUserId);
      } else {
        throw new Error('Target user ID is required');
      }
    },
    onSuccess: async () => {
      dispatch(removeFollowing(targetUserId));

      // Refetch all relevant data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['followStatus', targetUserId] }),
        // Invalidate both the target user's and current user's follow lists
        queryClient.invalidateQueries({ queryKey: ['followList', targetUserId, 'followers'] }),
        queryClient.invalidateQueries({ queryKey: ['followList', targetUserId, 'following'] }),
      ]);
    },
    onError: (error) => {
      console.error('Unfollow action failed:', error);
    },
  });

  const isFollowing = isFollowingFromApi ?? following.includes(targetUserId);
  const isLoading = isLoadingStatus;
  const isMutating = followMutation.isPending || unfollowMutation.isPending;

  return {
    isFollowing: !!targetUserId && isFollowing,
    isLoading,
    isMutating,
    follow: () => {
      if (targetUserId) {
        followMutation.mutate();
      }
    },
    unfollow: () => {
      if (targetUserId) {
        unfollowMutation.mutate();
      }
    },
  };
};
