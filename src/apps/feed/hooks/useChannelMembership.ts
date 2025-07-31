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

  // Check if user is a member of the channel (either in usersChannels or in Redux social channels)
  const isMemberInUsersChannels = usersChannels.some((channel) => channel.zid === zid);
  const isMemberInSocialChannels = socialChannels.some((channel) => channel.zid === zid);
  const isMember = isMemberInUsersChannels || isMemberInSocialChannels;

  // Get channel data from allChannels for token requirements
  const channelData = allChannels?.find((channel) => channel.zid === zid) || null;

  return { isMember, isLoading: false, channelData };
};
