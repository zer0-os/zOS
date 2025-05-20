import { useProfileApp } from '../../lib/useProfileApp';
import { useSelector, useDispatch } from 'react-redux';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { createConversation } from '../../../../store/create-conversation';

export const useUserPanel = () => {
  const { data, isLoading } = useProfileApp();
  const currentUser = useSelector(currentUserSelector);
  const dispatch = useDispatch();

  const handle = data?.handle;
  const profileImageUrl = data?.profileImage;
  const zid = data?.primaryZid;
  const userId = data?.userId;
  const isCurrentUser = userId === currentUser?.id;
  const followersCount = data?.followersCount;
  const followingCount = data?.followingCount;

  const handleStartConversation = () => {
    if (!userId) return;
    dispatch(createConversation({ userIds: [userId] }));
  };

  return {
    handle,
    profileImageUrl,
    zid,
    userId,
    isCurrentUser,
    isLoading,
    followersCount,
    followingCount,
    handleStartConversation,
  };
};
