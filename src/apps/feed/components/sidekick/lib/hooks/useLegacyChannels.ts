import { useOwnedZids } from '../../../../../../lib/hooks/useOwnedZids';

interface LegacyChannelData {
  joinedLegacyZids: string[];
  unjoinedLegacyZids: string[];
  isLoading: boolean;
  isError: boolean;
}

export const useLegacyChannels = (): LegacyChannelData => {
  // Fetch legacy owned ZIDs
  const { zids: ownedZids, isLoading: isLoadingOwned, isError: isErrorOwned } = useOwnedZids();

  // Process legacy ZIDs - all owned ZIDs go to Channels tab
  const legacyZids = ownedZids?.map((zid) => zid.split('.')[0]);
  const uniqueLegacyZids = legacyZids ? ([...new Set(legacyZids)] as string[]) : [];

  // All owned legacy ZIDs go to Channels tab
  const joinedLegacyZids = uniqueLegacyZids;

  // No legacy channels in Explore tab (all owned channels are in Channels tab)
  const unjoinedLegacyZids: string[] = [];

  return {
    joinedLegacyZids,
    unjoinedLegacyZids,
    isLoading: isLoadingOwned,
    isError: isErrorOwned,
  };
};
