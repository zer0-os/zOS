import { useSidekick } from '../components/sidekick/lib/useSidekick';
import { useSelector } from 'react-redux';
import { socialChannelsSelector } from '../../../store/channels/selectors';

export const useChannelMembership = (zid: string | undefined) => {
  const { usersChannels, allChannels, isLoadingZids } = useSidekick();
  const socialChannels = useSelector(socialChannelsSelector);

  if (!zid) {
    return { isMember: false, isLoading: false, channelData: null };
  }

  // If still loading, we can't determine membership yet
  if (isLoadingZids || !usersChannels) {
    return { isMember: false, isLoading: true, channelData: null };
  }

  // Get channel data from allChannels OR usersChannels for token requirements
  const channelData =
    allChannels?.find((channel) => channel.zid === zid) ||
    usersChannels?.find((channel) => channel.zid === zid) ||
    null;

  // Check if this is a token-gated channel (has token requirements)
  const isTokenGatedChannel = channelData?.tokenSymbol || channelData?.tokenAmount;

  // For token-gated channels, only check usersChannels (React Query cache)
  // For legacy social channels, also check socialChannels (Redux state)
  const isMemberInUsersChannels = usersChannels.some((channel) => channel.zid === zid);
  const isMemberInSocialChannels = !isTokenGatedChannel && socialChannels.some((channel) => channel.zid === zid);
  const isMember = isMemberInUsersChannels || isMemberInSocialChannels;

  // Debug logging to see which source is causing the issue
  if (isMember) {
    console.log('XXX useChannelMembership - isMember is true:', {
      zid,
      isTokenGatedChannel,
      isMemberInUsersChannels,
      isMemberInSocialChannels,
      usersChannelsCount: usersChannels.length,
      socialChannelsCount: socialChannels.length,
      socialChannelsZids: socialChannels.map((c) => c.zid),
    });
  }

  return { isMember, isLoading: false, channelData };
};
