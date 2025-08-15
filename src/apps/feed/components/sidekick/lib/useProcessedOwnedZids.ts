import { useOwnedZids } from '../../../../../lib/hooks/useOwnedZids';

interface ProcessedOwnedZidData {
  uniqueOwnedZids: string[];
  isLoading: boolean;
  isError: boolean;
}

export const useProcessedOwnedZids = (): ProcessedOwnedZidData => {
  // Fetch owned ZIDs
  const { zids: ownedZids, isLoading: isLoadingOwned, isError: isErrorOwned } = useOwnedZids();

  // Process owned ZIDs - remove subdomains and deduplicate
  const processedZids = ownedZids?.map((zid) => zid.split('.')[0]);
  const uniqueOwnedZids = processedZids ? ([...new Set(processedZids)] as string[]) : [];

  return {
    uniqueOwnedZids,
    isLoading: isLoadingOwned,
    isError: isErrorOwned,
  };
};
