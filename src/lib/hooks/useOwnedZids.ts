import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

import { userIdSelector } from '../../store/authentication/selectors';
import { fetchOwnedZIDs } from '../../store/edit-profile/api';

/**
 * Gets a list of ZIDs owned by the user.
 * Removes any 0:// prefix, and sorts alphabetically.
 * This data is retrieved via the zOS API.
 * @returns formatted and alphabetically sorted list of ZIDs
 */
export const useOwnedZids = () => {
  const userId = useSelector(userIdSelector);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user', 'zids', { userId }],
    queryFn: async () => {
      const zids = await fetchOwnedZIDs();
      return zids.map((zid) => zid.replace('0://', '')).sort();
    },
    enabled: !!userId,
  });

  return {
    zids: data,
    isLoading,
    isError,
  };
};
