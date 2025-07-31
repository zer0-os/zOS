import { useOwnedZids } from '../../../../../../lib/hooks/useOwnedZids';
import { useSelector } from 'react-redux';
import { socialChannelsSelector } from '../../../../../../store/channels/selectors';

interface LegacyChannelData {
  joinedLegacyZids: string[];
  unjoinedLegacyZids: string[];
  isLoading: boolean;
  isError: boolean;
}

export const useLegacyChannels = (): LegacyChannelData => {
  // Fetch legacy owned ZIDs
  const { zids: ownedZids, isLoading: isLoadingOwned, isError: isErrorOwned } = useOwnedZids();

  // Get social channels from Redux store (channels user has actually joined)
  const socialChannels = useSelector(socialChannelsSelector);

  // Process legacy ZIDs - only include those that user has actually joined
  const legacyZids = ownedZids?.map((zid) => zid.split('.')[0]);
  const uniqueLegacyZids = legacyZids ? ([...new Set(legacyZids)] as string[]) : [];

  // Get ZIDs of social channels user has joined
  const joinedSocialChannelZids = new Set(socialChannels.map((channel) => channel.zid).filter(Boolean));

  // Only include legacy ZIDs that user has actually joined
  const joinedLegacyZids = uniqueLegacyZids.filter((zid) => joinedSocialChannelZids.has(zid));

  // Legacy channels that user owns but hasn't joined
  const unjoinedLegacyZids = uniqueLegacyZids.filter((zid) => !joinedSocialChannelZids.has(zid));

  return {
    joinedLegacyZids,
    unjoinedLegacyZids,
    isLoading: isLoadingOwned,
    isError: isErrorOwned,
  };
};
