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

  // Process all token-gated channels
  const allTokenGatedChannels = allTokenGatedChannelsData?.channels || [];

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

  // Remove duplicates (token-gated channels take precedence)
  const uniqueUserChannels = userChannels.filter(
    (channel, index, self) => index === self.findIndex((c) => c.zid === channel.zid)
  );

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
