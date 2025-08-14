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
  console.log('XXX uniqueLegacyZids:', uniqueLegacyZids);
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

  // Process all token-gated channels
  const allTokenGatedChannels = allTokenGatedChannelsData?.channels || [];

  console.log('XXX allTokenGatedChannelsData:', allTokenGatedChannelsData);
  console.log('XXX allTokenGatedChannels:', allTokenGatedChannels);
  console.log('XXX allTokenGatedChannels length:', allTokenGatedChannels.length);

  // Combine legacy channels and user's token-gated channels for Channels tab
  const userChannels: ChannelItem[] = [
    // Token-gated channels (user's channels) - put first so they become "first occurrence"
    ...tokenGatedChannels.map((channel) => ({
      zid: channel.zid,
      memberCount: channel.memberCount,
      tokenSymbol: channel.tokenSymbol,
      tokenAmount: channel.tokenAmount,
      tokenAddress: channel.tokenAddress,
      network: channel.network,
    })),
    // Legacy channels (owned ZIDs) - put second so they get filtered out if duplicate
    ...uniqueLegacyZids.map((zid) => ({ zid })),
  ];

  console.log('XXX uniqueLegacyZids:', uniqueLegacyZids);
  console.log('XXX userChannels before deduplication:', userChannels);
  console.log('XXX userChannels length before deduplication:', userChannels.length);

  // Remove duplicates (keep first occurrence - token-gated channels will win)
  const finalUniqueUserChannels = userChannels.filter(
    (channel, index, self) => self.findIndex((c) => c.zid === channel.zid) === index
  );

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
