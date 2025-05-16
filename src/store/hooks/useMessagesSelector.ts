import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../reducer';
import { makeGetMessagesByIds } from '../messages/selectors';

export const useMessagesSelector = (ids: string[]) => {
  const selectMessagesByIdsInstance = useMemo(() => makeGetMessagesByIds(), []);
  const messagesSelector = useCallback(
    (state: RootState) => selectMessagesByIdsInstance(state, ids),
    [selectMessagesByIdsInstance, ids]
  );
  return useSelector(messagesSelector);
};
