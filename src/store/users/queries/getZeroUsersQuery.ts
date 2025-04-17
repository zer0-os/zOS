import { queryOptions } from '@tanstack/react-query';
import { getZEROUsers } from '../../channels-list/api';

export const getZeroUsersQuery = (matrixIds: string[]) =>
  queryOptions({
    queryKey: ['getZeroUsers', matrixIds],
    queryFn: () => getZEROUsers(matrixIds),
    staleTime: 10 * 5 * 1000,
  });
