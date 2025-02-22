import { useRouteMatch } from 'react-router-dom';

import { useOwnedZids } from '../../../../../lib/hooks/useOwnedZids';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store/reducer';
import { Stage as ProfileStage } from '../../../../../store/user-profile';
import { useState } from 'react';
import { selectSocialChannelsUnreadCounts } from './selectors';

export interface UnreadCount {
  total: number;
  highlight: number;
}

interface UseSidekickReturn {
  isErrorZids: boolean;
  isLoadingZids: boolean;
  isProfileOpen: boolean;
  selectedZId?: string;
  zids?: string[];
  search: string;
  unreadCounts: { [zid: string]: UnreadCount };
  setSearch: (search: string) => void;
}

export const useSidekick = (): UseSidekickReturn => {
  const [search, setSearch] = useState('');

  const route = useRouteMatch('/feed/:zid');
  const selectedZId = route?.params?.zid;

  const isProfileOpen = useSelector((state: RootState) => state.userProfile.stage !== ProfileStage.None);

  const { zids, isLoading, isError } = useOwnedZids();

  const worldZids = zids?.map((zid) => zid.split('.')[0]);
  const uniqueWorldZids = worldZids ? ([...new Set(worldZids)] as string[]) : undefined;

  const filteredZids = uniqueWorldZids?.filter((zid) => zid.toLowerCase().includes(search.toLowerCase()));

  const unreadCounts = useSelector(selectSocialChannelsUnreadCounts);

  return {
    isErrorZids: isError,
    isLoadingZids: isLoading,
    isProfileOpen,
    selectedZId,
    zids: filteredZids,
    search,
    setSearch,
    unreadCounts,
  };
};
