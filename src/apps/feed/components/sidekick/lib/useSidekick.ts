import { useRouteMatch } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectSocialChannelsMemberCounts } from './selectors';
import { useProcessedOwnedZids } from './useProcessedOwnedZids';
import { useChannelLists } from './useChannelLists';
import { useTokenInfoBatch } from './useTokenInfoBatch';
import { ChannelItem, TokenInfoResponse } from './types';

interface UseSidekickReturn {
  isErrorZids: boolean;
  isLoadingZids: boolean;
  isErrorMine: boolean;
  isErrorAll: boolean;
  selectedZId?: string;
  usersChannels?: ChannelItem[];
  allChannels?: ChannelItem[];
  search: string;
  memberCounts: { [zid: string]: number };
  setSearch: (search: string) => void;
  tokenInfoMap: Map<string, TokenInfoResponse>;
}

export const useSidekick = (): UseSidekickReturn => {
  const [search, setSearch] = useState('');

  const route = useRouteMatch('/feed/:zid');
  const selectedZId = route?.params?.zid;

  // Get processed owned ZID data
  const { uniqueOwnedZids, isLoading: isLoadingOwned, isError: isErrorOwned } = useProcessedOwnedZids();

  // Get channel lists data
  const {
    usersChannels,
    allChannels,
    isLoading: isLoadingChannels,
    isErrorMine,
    isErrorAll,
  } = useChannelLists(uniqueOwnedZids);

  // Apply search filter to user channels with memoization
  const filteredUserChannels = useMemo(
    () => usersChannels?.filter((channel) => channel.zid.toLowerCase().includes(search.toLowerCase())),
    [usersChannels, search]
  );

  // Apply search filter to all channels with memoization
  const filteredAllChannelsWithSearch = useMemo(
    () => allChannels?.filter((channel) => channel.zid.toLowerCase().includes(search.toLowerCase())),
    [allChannels, search]
  );

  const memberCounts = useSelector(selectSocialChannelsMemberCounts);

  // Fetch token info for all channels
  const { tokenInfoMap } = useTokenInfoBatch([
    ...(filteredUserChannels || []),
    ...(filteredAllChannelsWithSearch || []),
  ]);

  return {
    isErrorZids: isErrorOwned,
    isLoadingZids: isLoadingOwned || isLoadingChannels,
    isErrorMine,
    isErrorAll,
    selectedZId,
    usersChannels: filteredUserChannels,
    allChannels: filteredAllChannelsWithSearch,
    search,
    setSearch,
    memberCounts,
    tokenInfoMap,
  };
};
