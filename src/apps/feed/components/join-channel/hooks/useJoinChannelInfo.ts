import { useQuery } from '@tanstack/react-query';
import { post, get } from '../../../../../lib/api/rest';

interface TokenRequirements {
  symbol: string;
  amount: string;
  address: string;
}

interface ChannelInfo {
  isTokenGated: boolean;
  tokenRequirements?: TokenRequirements;
  isMember: boolean;
}

export const useJoinChannelInfo = (zid: string | undefined) => {
  const {
    data: channelInfo,
    isLoading,
    error,
  } = useQuery<ChannelInfo>({
    queryKey: ['channel-info', zid],
    queryFn: async () => {
      if (!zid) {
        return null;
      }

      const zna = zid.replace('0://', '');

      // Check if user has access to the channel

      // TODO: we should only check access if the zid is not in the users list of zids in channels app
      // But we still need to figure out how to display those zids in the list
      // as these can't just be domains they own
      const accessResponse = await post('/token-gated-channels/check-access').send({ zid: zna });
      const hasAccess = accessResponse.ok ? accessResponse.body.hasAccess : false;

      // If user has access, return immediately - no need to fetch settings
      if (hasAccess) {
        return {
          isTokenGated: false, // We don't know, but it doesn't matter since user has access
          isMember: true,
        };
      }

      // If user doesn't have access, we need to determine if this is a token-gated channel
      // or a legacy channel to show the appropriate UI
      try {
        const settingsResponse = await get(`/token-gated-channels/settings/${zna}`);

        if (settingsResponse.ok) {
          const data = settingsResponse.body;
          return {
            isTokenGated: true,
            tokenRequirements: {
              symbol: data.tokenSymbol,
              amount: data.tokenAmount,
              address: data.tokenAddress,
            },
            isMember: false,
          };
        } else {
          // No token gated settings found, treat as legacy channel
          return {
            isTokenGated: false,
            isMember: false,
          };
        }
      } catch (error) {
        // If settings request fails, treat as legacy channel
        return {
          isTokenGated: false,
          isMember: false,
        };
      }
    },
    enabled: !!zid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    channelInfo,
    isLoading,
    error,
  };
};
