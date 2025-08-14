import { useTokenGatedChannels } from '../../../hooks/useTokenGatedChannels';
import { ChannelItem } from './types';

interface ChannelListsData {
  usersChannels: ChannelItem[];
  allChannels: ChannelItem[];
  isLoading: boolean;
  isErrorMine: boolean;
  isErrorAll: boolean;
}

export const useChannelLists = (uniqueLegacyZids: string[]): ChannelListsData => {
  // Fetch token-gated channels (user's channels) - always fetch for Channels tab
  const {
    data: tokenGatedChannelsData,
    isLoading: isLoadingTokenGated,
    error: tokenGatedError,
  } = useTokenGatedChannels('mine');

  // Fetch all token-gated channels - always fetch for Explore tab (cached by React Query)
  const { data: allTokenGatedChannelsData, error: allTokenGatedError } = useTokenGatedChannels('all');

  // Process token-gated channels (user's channels)
  const tokenGatedChannels = tokenGatedChannelsData?.channels || [];

  console.log('XXX tokenGatedChannelsData:', tokenGatedChannelsData);
  console.log('XXX tokenGatedChannels:', tokenGatedChannels);
  console.log('XXX Sample token-gated channel:', tokenGatedChannels[0]);

  // Process all token-gated channels
  const allTokenGatedChannels = allTokenGatedChannelsData?.channels || [];

  console.log('XXX allTokenGatedChannelsData:', allTokenGatedChannelsData);
  console.log('XXX allTokenGatedChannels:', allTokenGatedChannels);
  console.log('XXX Sample all token-gated channel:', allTokenGatedChannels[0]);

  // Combine legacy channels and user's token-gated channels for Channels tab
  const userChannels: ChannelItem[] = [
    // Legacy channels (owned ZIDs)
    ...uniqueLegacyZids.map((zid) => ({ zid })),
    // Token-gated channels (user's channels)
    ...tokenGatedChannels.map((channel) => ({
      zid: channel.zid,
      memberCount: channel.memberCount,
      tokenSymbol: channel.tokenSymbol,
      tokenAmount: channel.tokenAmount,
      tokenAddress: channel.tokenAddress,
      network: channel.network,
    })),
  ];

  // Remove duplicates (token-gated channels take precedence over legacy channels)
  const uniqueUserChannels = userChannels.filter((channel, index, self) => {
    const firstIndex = self.findIndex((c) => c.zid === channel.zid);
    if (firstIndex === index) {
      return true; // Keep the first occurrence
    }
    // If this is a duplicate, check if the current channel has token properties and the first doesn't
    const firstChannel = self[firstIndex];
    const currentHasTokenProps = channel.tokenAddress && channel.network;
    const firstHasTokenProps = firstChannel.tokenAddress && firstChannel.network;

    // Keep current channel if it has token properties and first doesn't
    return currentHasTokenProps && !firstHasTokenProps;
  });

  // Process all channels for Explore tab
  const allChannels: ChannelItem[] = allTokenGatedChannels.map((channel) => ({
    zid: channel.zid,
    memberCount: channel.memberCount,
    tokenSymbol: channel.tokenSymbol,
    tokenAmount: channel.tokenAmount,
    tokenAddress: channel.tokenAddress,
    network: channel.network,
  }));

  // Filter out channels that the user is already a member of
  const userChannelZids = new Set([...uniqueLegacyZids, ...tokenGatedChannels.map((channel) => channel.zid)]);

  const filteredAllChannels = allChannels.filter((channel) => !userChannelZids.has(channel.zid));

  return {
    usersChannels: uniqueUserChannels,
    allChannels: filteredAllChannels,
    isLoading: isLoadingTokenGated,
    isErrorMine: !!tokenGatedError,
    isErrorAll: !!allTokenGatedError,
  };
};
