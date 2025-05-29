import { queryOptions } from '@tanstack/react-query';
import { getZEROUsers } from '../../channels-list/api';

export const getZeroUsersQuery = ({ matrixIds, userIds }: { matrixIds?: string[]; userIds?: string[] }) =>
  queryOptions({
    queryKey: ['getZeroUsers', [...(matrixIds ?? []), ...(userIds ?? [])]],
    queryFn: () => getZEROUsers(matrixIds, userIds),
    staleTime: 10 * 5 * 1000,
  });
