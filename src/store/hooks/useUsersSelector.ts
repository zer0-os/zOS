import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../reducer';
import { makeGetUsersByIds } from '../users/selectors';

export const useUsersSelector = (ids: string[]) => {
  const selectUsersByIdsInstance = useMemo(() => makeGetUsersByIds(), []);
  const usersSelector = useCallback(
    (state: RootState) => selectUsersByIdsInstance(state, ids),
    [selectUsersByIdsInstance, ids]
  );
  return useSelector(usersSelector);
};
