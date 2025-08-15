import { useSidekick } from '../components/sidekick/lib/useSidekick';
import { useSelector } from 'react-redux';
import { socialChannelsSelector } from '../../../store/channels/selectors';

export const useChannelMembership = (zid: string | undefined) => {
  const { usersChannels, allChannels, isLoadingZids } = useSidekick();
  const socialChannels = useSelector(socialChannelsSelector);

  if (!zid) {
    return { isMember: false, isLoading: false, channelData: null };
  }

  if (isLoadingZids || !usersChannels) {
    return { isMember: false, isLoading: true, channelData: null };
  }

  const channelData =
    allChannels?.find((channel) => channel.zid === zid) ||
    usersChannels?.find((channel) => channel.zid === zid) ||
    null;

  const isTokenGatedChannel = channelData?.tokenSymbol || channelData?.tokenAmount;

  const isMemberInUsersChannels = usersChannels.some((channel) => channel.zid === zid);
  const isMemberInSocialChannels = !isTokenGatedChannel && socialChannels.some((channel) => channel.zid === zid);
  const isMember = isMemberInUsersChannels || isMemberInSocialChannels;

  return { isMember, isLoading: false, channelData };
};
