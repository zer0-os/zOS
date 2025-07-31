import { useRouteMatch } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectMutedChannels, selectSocialChannelsUnreadCounts, selectSocialChannelsMemberCounts } from './selectors';
import { useLegacyChannels } from './hooks/useLegacyChannels';
import { useChannelLists, type ChannelItem } from './hooks/useChannelLists';

export interface UnreadCount {
  total: number;
  highlight: number;
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

  // Get legacy channel data
  const {
    joinedLegacyZids,
    unjoinedLegacyZids,
    isLoading: isLoadingLegacy,
    isError: isErrorLegacy,
  } = useLegacyChannels();

  // Get channel lists data
  const {
    usersChannels,
    allChannels,
    isLoading: isLoadingChannels,
    isErrorMine,
    isErrorAll,
  } = useChannelLists(joinedLegacyZids, unjoinedLegacyZids);

  // Apply search filter to user channels
  const filteredUserChannels = usersChannels?.filter((channel) =>
    channel.zid.toLowerCase().includes(search.toLowerCase())
  );

  // Apply search filter to all channels
  const filteredAllChannelsWithSearch = allChannels?.filter((channel) =>
    channel.zid.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCounts = useSelector(selectSocialChannelsUnreadCounts);
  const mutedChannels = useSelector(selectMutedChannels);
  const memberCounts = useSelector(selectSocialChannelsMemberCounts);

  return {
    isErrorZids: isErrorLegacy,
    isLoadingZids: isLoadingLegacy || isLoadingChannels,
    isErrorMine,
    isErrorAll,
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
