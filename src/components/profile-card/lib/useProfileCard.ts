import millify from 'millify';
import { useProfile } from '../../../apps/profile/lib/useProfile';
import { useFollow } from '../../../apps/profile/lib/useFollow';
import { useSelector } from 'react-redux';
import { currentUserSelector } from '../../../store/authentication/selectors';
import { useOpenProfile } from '../../../apps/profile/lib/useOpenProfile';

export interface UseProfileCardReturn {
  followerCount?: string;
  followingCount?: string;
  handle?: string;
  isFollowing: boolean;
  isLoading: boolean;
  isOwnProfile: boolean;
  onClickAvatar: () => void;
  onClickFollow: () => void;
  profileImage?: string;
  subhandle?: string;
}

export const useProfileCard = (userId: string): UseProfileCardReturn => {
  const currentUser = useSelector(currentUserSelector);

  const { isLoading, data } = useProfile({ id: userId });
  const { follow, unfollow, isFollowing } = useFollow(data?.userId);
  const { onOpenProfile } = useOpenProfile();

  const isOwnProfile = data?.userId === currentUser?.id;

  const onClickAvatar = () => {
    if (data?.primaryZid || data?.publicAddress) {
      onOpenProfile(data.primaryZid ?? data.publicAddress);
    }
  };

  const onClickFollow = () => {
    if (!data?.userId) return;
    if (isFollowing) {
      unfollow();
    } else {
      follow();
    }
  };

  return {
    followerCount: data?.followersCount !== undefined ? millify(data.followersCount) : undefined,
    followingCount: data?.followingCount !== undefined ? millify(data.followingCount) : undefined,
    handle: data?.handle,
    isFollowing,
    isLoading: isLoading,
    isOwnProfile,
    onClickAvatar,
    onClickFollow,
    profileImage: data?.profileImage,
    subhandle: data?.primaryZid ? `0://${data.primaryZid}` : data?.publicAddress,
  };
};
