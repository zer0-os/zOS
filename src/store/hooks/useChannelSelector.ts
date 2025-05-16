import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../reducer';
import { makeGetChannelById } from '../channels/selectors';

/**
 * Selector hook for getting a normalized channel by ID.
 * It is highly recommended to use this normalized data due to the denormalization process
 * causing new references to be created for each render.
 * @param id - The ID of the channel to select.
 * @returns The normalized channel with the given ID.
 */
export const useChannelSelector = (id: string) => {
  const selectChannelByIdInstance = useMemo(() => makeGetChannelById(), []);
  const channelSelector = useCallback(
    (state: RootState) => selectChannelByIdInstance(state, id),
    [selectChannelByIdInstance, id]
  );
  return useSelector(channelSelector);
};
