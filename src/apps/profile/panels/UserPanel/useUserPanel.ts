import { useProfileApp } from '../../lib/useProfileApp';
import { useSelector, useDispatch } from 'react-redux';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { createConversation } from '../../../../store/create-conversation';
import { allChannelsSelector } from '../../../../store/channels/selectors';
import { openConversation } from '../../../../store/channels';
import { isOneOnOne } from '../../../../store/channels-list/utils';

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
  const allChannels = useSelector(allChannelsSelector);

  const handleStartConversation = () => {
    if (!userId) return;
    // Find existing 1:1 conversation with this user
    const existing = allChannels.find(
      (c) => isOneOnOne(c) && c.otherMembers.length === 1 && c.otherMembers[0] === userId
    );
    if (existing) {
      dispatch(openConversation({ conversationId: existing.id }));
    } else {
      dispatch(createConversation({ userIds: [userId] }));
    }
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
