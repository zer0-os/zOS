import { useRouteMatch } from 'react-router-dom';
import { useState } from 'react';
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

  // Apply search filter to user channels
  const filteredUserChannels = usersChannels?.filter((channel) =>
    channel.zid.toLowerCase().includes(search.toLowerCase())
  );

  // Apply search filter to all channels
  const filteredAllChannelsWithSearch = allChannels?.filter((channel) =>
    channel.zid.toLowerCase().includes(search.toLowerCase())
  );

  const memberCounts = useSelector(selectSocialChannelsMemberCounts);

  // Fetch token info for all channels
  const { tokenInfoMap } = useTokenInfoBatch([
    ...(filteredUserChannels || []),
    ...(filteredAllChannelsWithSearch || []),
  ]);

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
