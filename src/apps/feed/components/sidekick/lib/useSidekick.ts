import { useRouteMatch } from 'react-router-dom';
import { useOwnedZids } from '../../../../../lib/hooks/useOwnedZids';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { selectMutedChannels, selectSocialChannelsUnreadCounts, selectSocialChannelsMemberCounts } from './selectors';
import { socialChannelsSelector } from '../../../../../store/channels/selectors';
import { useTokenGatedChannels } from '../../../hooks/useTokenGatedChannels';

export interface UnreadCount {
  total: number;
  highlight: number;
}

interface ChannelItem {
  zid: string;
  isLegacy: boolean;
  memberCount?: number;
  tokenSymbol?: string;
  tokenAmount?: string;
  tokenAddress?: string;
}

interface UseSidekickReturn {
  isErrorZids: boolean;
  isLoadingZids: boolean;
  isErrorMine: boolean;
  isErrorAll: boolean;
  selectedZId?: string;
  usersChannels?: ChannelItem[];
  allChannels?: ChannelItem[];
  search: string;
  unreadCounts: { [zid: string]: UnreadCount };
  mutedChannels: { [zid: string]: boolean };
  memberCounts: { [zid: string]: number };
  setSearch: (search: string) => void;
}

export const useSidekick = (): UseSidekickReturn => {
  const [search, setSearch] = useState('');

  const route = useRouteMatch('/feed/:zid');
  const selectedZId = route?.params?.zid;

  // Get social channels from Redux store (channels user has actually joined)
  const socialChannels = useSelector(socialChannelsSelector);

  // Fetch legacy owned ZIDs
  const { zids: ownedZids, isLoading: isLoadingOwned, isError: isErrorOwned } = useOwnedZids();

  // Fetch token-gated channels (user's channels) - always fetch for Channels tab
  const {
    data: tokenGatedChannelsData,
    isLoading: isLoadingTokenGated,
    error: tokenGatedError,
  } = useTokenGatedChannels('mine');

  // Fetch all token-gated channels - always fetch for Explore tab (cached by React Query)
  const { data: allTokenGatedChannelsData, error: allTokenGatedError } = useTokenGatedChannels('all');

  // Process legacy ZIDs - only include those that user has actually joined
  const legacyZids = ownedZids?.map((zid) => zid.split('.')[0]);
  const uniqueLegacyZids = legacyZids ? ([...new Set(legacyZids)] as string[]) : [];

  // Get ZIDs of social channels user has joined
  const joinedSocialChannelZids = new Set(socialChannels.map((channel) => channel.zid).filter(Boolean));

  // Only include legacy ZIDs that user has actually joined
  const joinedLegacyZids = uniqueLegacyZids.filter((zid) => joinedSocialChannelZids.has(zid));

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
  }));

  // Add legacy channels that user owns but hasn't joined to Explore tab
  const unjoinedLegacyZids = uniqueLegacyZids.filter((zid) => !joinedSocialChannelZids.has(zid));
  const legacyChannelsForExplore: ChannelItem[] = unjoinedLegacyZids.map((zid) => ({
    zid,
    isLegacy: true,
  }));

  // Combine new token-gated channels and unjoined legacy channels for Explore tab
  const allChannelsForExplore = [...allChannels, ...legacyChannelsForExplore];

  // Filter out channels that the user is already a member of
  const userChannelZids = new Set([...joinedLegacyZids, ...tokenGatedChannels.map((channel) => channel.zid)]);

  const filteredAllChannels = allChannelsForExplore.filter((channel) => !userChannelZids.has(channel.zid));

  // Apply search filter to user channels
  const filteredUserChannels = uniqueUserChannels.filter((channel) =>
    channel.zid.toLowerCase().includes(search.toLowerCase())
  );

  // Apply search filter to all channels (excluding user's channels)
  const filteredAllChannelsWithSearch = filteredAllChannels.filter((channel) =>
    channel.zid.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCounts = useSelector(selectSocialChannelsUnreadCounts);
  const mutedChannels = useSelector(selectMutedChannels);
  const memberCounts = useSelector(selectSocialChannelsMemberCounts);

  return {
    isErrorZids: isErrorOwned || !!tokenGatedError,
    isLoadingZids: isLoadingOwned || isLoadingTokenGated,
    isErrorMine: !!tokenGatedError,
    isErrorAll: !!allTokenGatedError,
    selectedZId,
    usersChannels: filteredUserChannels,
    allChannels: filteredAllChannelsWithSearch,
    search,
    setSearch,
    unreadCounts,
    mutedChannels,
    memberCounts,
  };
};
