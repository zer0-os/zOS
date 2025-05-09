import { useProfileApp } from '../../lib/useProfileApp';
import { useSelector } from 'react-redux';
import { currentUserSelector } from '../../../../store/authentication/selectors';

export const useUserPanel = () => {
  const { data, isLoading } = useProfileApp();
  const currentUser = useSelector(currentUserSelector);

  const handle = data?.handle;
  const profileImageUrl = data?.profileImage;
  const zid = data?.primaryZid;
  const userId = data?.userId;
  const isCurrentUser = userId === currentUser?.id;
  const followersCount = data?.followersCount;
  const followingCount = data?.followingCount;

  return {
    handle,
    profileImageUrl,
    zid,
    userId,
    isCurrentUser,
    isLoading,
    followersCount,
    followingCount,
  };
};
