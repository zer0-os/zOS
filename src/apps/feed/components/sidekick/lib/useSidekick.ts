import { useRouteMatch } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectSocialChannelsMemberCounts } from './selectors';
import { useLegacyChannels } from './useLegacyChannels';
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

  // Get legacy channel data
  const { uniqueLegacyZids, isLoading: isLoadingLegacy, isError: isErrorLegacy } = useLegacyChannels();

  // Get channel lists data
  const {
    usersChannels,
    allChannels,
    isLoading: isLoadingChannels,
    isErrorMine,
    isErrorAll,
  } = useChannelLists(uniqueLegacyZids);

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

  const allChannelsForTokenInfo = useMemo(
    () => [
      ...(filteredUserChannels || []),
      ...(filteredAllChannelsWithSearch || []),
    ],
    [filteredUserChannels, filteredAllChannelsWithSearch]
  );

  const { tokenInfoMap } = useTokenInfoBatch(allChannelsForTokenInfo);

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
    memberCounts,
    tokenInfoMap,
  };
};
