import { useSidekick } from '../components/sidekick/lib/useSidekick';

export const useChannelMembership = (zid: string | undefined) => {
  const { usersChannels, allChannels, isLoadingZids } = useSidekick();

  if (!zid) {
    return { isMember: false, isLoading: false, channelData: null };
  }

  // If still loading, we can't determine membership yet
  if (isLoadingZids || !usersChannels) {
    return { isMember: false, isLoading: true, channelData: null };
  }

  const isMember = usersChannels.some((channel) => channel.zid === zid);

  // Get channel data from allChannels for token requirements
  const channelData = allChannels?.find((channel) => channel.zid === zid) || null;

  return { isMember, isLoading: false, channelData };
};
