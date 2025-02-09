import { useRouteMatch } from 'react-router-dom';

import { useOwnedZids } from '../../../../../lib/hooks/useOwnedZids';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store/reducer';
import { Stage as ProfileStage } from '../../../../../store/user-profile';

interface UseSidekickReturn {
  isErrorZids: boolean;
  isLoadingZids: boolean;
  isProfileOpen: boolean;
  selectedZId?: string;
  zids?: string[];
}

export const useSidekick = (): UseSidekickReturn => {
  const route = useRouteMatch('/feed/:zid');
  const selectedZId = route?.params?.zid;

  const isProfileOpen = useSelector((state: RootState) => state.userProfile.stage !== ProfileStage.None);

  const { zids, isLoading, isError } = useOwnedZids();

  const worldZids = zids?.map((zid) => zid.split('.')[0]);
  const uniqueWorldZids = worldZids ? ([...new Set(worldZids)] as string[]) : undefined;

  return {
    isErrorZids: isError,
    isLoadingZids: isLoading,
    isProfileOpen,
    selectedZId,
    zids: uniqueWorldZids,
  };
};
