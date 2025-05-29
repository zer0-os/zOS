import millify from 'millify';
import { useDispatch, useSelector } from 'react-redux';

import { useFollow } from '../../../apps/profile/lib/useFollow';
import { useOpenProfile } from '../../../apps/profile/lib/useOpenProfile';
import { useProfile } from '../../../apps/profile/lib/useProfile';
import { getUserSubHandle } from '../../../lib/user';

import { currentUserSelector } from '../../../store/authentication/selectors';
import { allChannelsSelector } from '../../../store/channels/selectors';
import { openConversation } from '../../../store/channels';
import { createConversation } from '../../../store/create-conversation';
import { isOneOnOne } from '../../../store/channels-list/utils';

export interface UseProfileCardReturn {
  followerCount?: string;
  followingCount?: string;
  handle?: string;
  isFollowing: boolean;
  isLoading: boolean;
  isLoadingFollowing: boolean;
  isOwnProfile: boolean;
  onClickAvatar: () => void;
  onClickChat: () => void;
  onClickFollow: () => void;
  profileImage?: string;
  subhandle?: string;
}

export const useProfileCard = (userId: string): UseProfileCardReturn => {
  const currentUser = useSelector(currentUserSelector);
  const { isLoading, data } = useProfile({ id: userId });
  const { follow, unfollow, isFollowing, isLoading: isLoadingFollowing } = useFollow(data?.userId);
  const { onOpenProfile } = useOpenProfile();
  const dispatch = useDispatch();
  const allChannels = useSelector(allChannelsSelector);

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

  const onClickChat = () => {
    if (!data?.userId) return;
    const existing = allChannels.find(
      (c) => isOneOnOne(c) && c.otherMembers.length === 1 && c.otherMembers[0] === data.userId
    );
    if (existing) {
      dispatch(openConversation({ conversationId: existing.id }));
    } else {
      dispatch(createConversation({ userIds: [data.userId] }));
    }
  };

  return {
    followerCount: data?.followersCount !== undefined ? millify(data.followersCount) : undefined,
    followingCount: data?.followingCount !== undefined ? millify(data.followingCount) : undefined,
    handle: data?.handle,
    isFollowing,
    isLoading,
    isLoadingFollowing,
    isOwnProfile,
    onClickAvatar,
    onClickChat,
    onClickFollow,
    profileImage: data?.profileImage,
    subhandle: data?.primaryZid ? `0://${data.primaryZid}` : getUserSubHandle(undefined, data?.publicAddress),
  };
};
