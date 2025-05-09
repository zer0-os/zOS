import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { getFollowStatus, followUser, unfollowUser } from '../../../store/user-follows/api';
import { addFollowing, removeFollowing } from '../../../store/user-follows';
import { RootState } from '../../../store/reducer';

const followingSelector = (state: RootState) => state.userFollows.following;

export const useFollow = (targetUserId: string) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const following = useSelector(followingSelector);

  const { isLoading: isLoadingStatus } = useQuery({
    queryKey: ['followStatus', targetUserId],
    queryFn: () => getFollowStatus(targetUserId),
  });

  const followMutation = useMutation({
    mutationFn: () => followUser(targetUserId),
    onSuccess: () => {
      dispatch(addFollowing(targetUserId));
      queryClient.invalidateQueries({ queryKey: ['followStatus', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
    },
    onError: (error) => {
      console.error('Follow action failed:', error);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(targetUserId),
    onSuccess: () => {
      dispatch(removeFollowing(targetUserId));
      queryClient.invalidateQueries({ queryKey: ['followStatus', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
    },
    onError: (error) => {
      console.error('Unfollow action failed:', error);
    },
  });

  const isFollowing = following.includes(targetUserId);
  const isLoading = isLoadingStatus || followMutation.isPending || unfollowMutation.isPending;

  return {
    isFollowing,
    isLoading,
    follow: () => followMutation.mutate(),
    unfollow: () => unfollowMutation.mutate(),
  };
};
