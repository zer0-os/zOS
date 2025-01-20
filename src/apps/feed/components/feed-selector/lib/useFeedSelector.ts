import { useRouteMatch } from 'react-router-dom';

import { useOwnedZids } from '../../../../../lib/hooks/useOwnedZids';

interface UseFeedSelectorReturn {
  zids?: string[];
  isLoadingZids: boolean;
  isErrorZids: boolean;
  selectedZId?: string;
}

export const useFeedSelector = (): UseFeedSelectorReturn => {
  const route = useRouteMatch('/feed/:zid');
  const selectedZId = route?.params?.zid;

  const { zids, isLoading, isError } = useOwnedZids();

  const worldZids = zids?.map((zid) => zid.split('.')[0]);
  const uniqueWorldZids = worldZids ? ([...new Set(worldZids)] as string[]) : undefined;

  return {
    zids: uniqueWorldZids,
    isLoadingZids: isLoading,
    isErrorZids: isError,
    selectedZId,
  };
};
