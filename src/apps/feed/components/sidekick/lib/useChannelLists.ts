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
  console.log('XXX tokenGatedChannels length:', tokenGatedChannels.length);

  // Remove duplicates from token-gated channels (keep first occurrence of each zid)
  const uniqueTokenGatedChannels = tokenGatedChannels.filter(
    (channel, index, self) => self.findIndex((c) => c.zid === channel.zid) === index
  );

  console.log('XXX uniqueTokenGatedChannels:', uniqueTokenGatedChannels);
  console.log('XXX uniqueTokenGatedChannels length:', uniqueTokenGatedChannels.length);

  // Process all token-gated channels
  const allTokenGatedChannels = allTokenGatedChannelsData?.channels || [];

  console.log('XXX allTokenGatedChannelsData:', allTokenGatedChannelsData);
  console.log('XXX allTokenGatedChannels:', allTokenGatedChannels);
  console.log('XXX allTokenGatedChannels length:', allTokenGatedChannels.length);

  // Combine legacy channels and user's token-gated channels for Channels tab
  const userChannels: ChannelItem[] = [
    // Legacy channels (owned ZIDs)
    ...uniqueLegacyZids.map((zid) => ({ zid })),
    // Token-gated channels (user's channels)
    ...uniqueTokenGatedChannels.map((channel) => ({
      zid: channel.zid,
      memberCount: channel.memberCount,
      tokenSymbol: channel.tokenSymbol,
      tokenAmount: channel.tokenAmount,
      tokenAddress: channel.tokenAddress,
      network: channel.network,
    })),
  ];

  console.log('XXX uniqueLegacyZids:', uniqueLegacyZids);
  console.log('XXX userChannels before deduplication:', userChannels);
  console.log('XXX userChannels length before deduplication:', userChannels.length);

  // Remove duplicates and prioritize token-gated channels over legacy channels
  const finalUniqueUserChannels = userChannels.filter((channel, index, self) => {
    const firstIndex = self.findIndex((c) => c.zid === channel.zid);
    if (firstIndex === index) {
      return true; // Keep the first occurrence
    }

    // If this is a duplicate, prioritize token-gated channels
    const firstChannel = self[firstIndex];
    const currentHasTokenProps = channel.tokenAddress && channel.network;
    const firstHasTokenProps = firstChannel.tokenAddress && firstChannel.network;

    console.log('XXX Deduplication check:', {
      zid: channel.zid,
      index,
      firstIndex,
      currentHasTokenProps,
      firstHasTokenProps,
      currentChannel: channel,
      firstChannel: firstChannel,
      willKeep: currentHasTokenProps && !firstHasTokenProps,
    });

    // Keep current channel if it has token properties and first doesn't
    if (currentHasTokenProps && !firstHasTokenProps) {
      return true;
    }

    // If first channel has token properties and current doesn't, keep first (reject current)
    if (firstHasTokenProps && !currentHasTokenProps) {
      return false;
    }

    // If both have token properties or both don't, keep the first one (reject current)
    return false;
  });

  console.log('XXX finalUniqueUserChannels:', finalUniqueUserChannels);
  console.log('XXX finalUniqueUserChannels length:', finalUniqueUserChannels.length);

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
    usersChannels: finalUniqueUserChannels,
    allChannels: filteredAllChannels,
    isLoading: isLoadingTokenGated,
    isErrorMine: !!tokenGatedError,
    isErrorAll: !!allTokenGatedError,
  };
};
