import { useOwnedZids } from '../../../../../lib/hooks/useOwnedZids';

interface UseFeedSelectorReturn {
  zids?: string[];
  isLoadingZids: boolean;
  isErrorZids: boolean;
}

export const useFeedSelector = (): UseFeedSelectorReturn => {
  const { zids, isLoading, isError } = useOwnedZids();

  const worldZids = zids?.map((zid) => zid.split('.')[0]);
  const uniqueWorldZids = worldZids ? ([...new Set(worldZids)] as string[]) : undefined;

  return {
    zids: uniqueWorldZids,
    isLoadingZids: isLoading,
    isErrorZids: isError,
  };
};
