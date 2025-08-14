import { useOwnedZids } from '../../../../../lib/hooks/useOwnedZids';

interface LegacyChannelData {
  uniqueLegacyZids: string[];
  isLoading: boolean;
  isError: boolean;
}

export const useLegacyChannels = (): LegacyChannelData => {
  // Fetch legacy owned ZIDs
  const { zids: ownedZids, isLoading: isLoadingOwned, isError: isErrorOwned } = useOwnedZids();

  // Process legacy ZIDs - all owned ZIDs go to Channels tab
  const legacyZids = ownedZids?.map((zid) => zid.split('.')[0]);
  const uniqueLegacyZids = legacyZids ? ([...new Set(legacyZids)] as string[]) : [];

  return {
    uniqueLegacyZids,
    isLoading: isLoadingOwned,
    isError: isErrorOwned,
  };
};
