import { useTokenGatedChannels } from '../../../../hooks/useTokenGatedChannels';

export interface ChannelItem {
  zid: string;
  isLegacy: boolean;
  memberCount?: number;
  tokenSymbol?: string;
  tokenAmount?: string;
  tokenAddress?: string;
  network?: string;
}

interface ChannelListsData {
  usersChannels: ChannelItem[];
  allChannels: ChannelItem[];
  isLoading: boolean;
  isErrorMine: boolean;
  isErrorAll: boolean;
}

export const useChannelLists = (joinedLegacyZids: string[], unjoinedLegacyZids: string[]): ChannelListsData => {
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

  // Combine joined legacy channels and user's token-gated channels for Channels tab
  const userChannels: ChannelItem[] = [
    // Legacy channels (owned ZIDs that user has joined)
    ...joinedLegacyZids.map((zid) => ({
      zid,
      isLegacy: true,
    })),
    // Token-gated channels (user's channels)
    ...tokenGatedChannels.map((channel) => ({
      zid: channel.zid,
      isLegacy: false,
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
    isLegacy: false,
    memberCount: channel.memberCount,
    tokenSymbol: channel.tokenSymbol,
    tokenAmount: channel.tokenAmount,
    tokenAddress: channel.tokenAddress,
    network: channel.network,
  }));

  // Add legacy channels that user owns but hasn't joined to Explore tab
  const legacyChannelsForExplore: ChannelItem[] = unjoinedLegacyZids.map((zid) => ({
    zid,
    isLegacy: true,
  }));

  // Combine new token-gated channels and unjoined legacy channels for Explore tab
  const allChannelsForExplore = [...allChannels, ...legacyChannelsForExplore];

  // Filter out channels that the user is already a member of
  const userChannelZids = new Set([...joinedLegacyZids, ...tokenGatedChannels.map((channel) => channel.zid)]);

  const filteredAllChannels = allChannelsForExplore.filter((channel) => !userChannelZids.has(channel.zid));

  return {
    usersChannels: uniqueUserChannels,
    allChannels: filteredAllChannels,
    isLoading: isLoadingTokenGated,
    isErrorMine: !!tokenGatedError,
    isErrorAll: !!allTokenGatedError,
  };
};
