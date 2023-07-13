import { normalize as normalizeChannel } from '../../channels';
import { RootState } from '../../reducer';

export function existingChannelState(channel) {
  const normalized = normalizeChannel(channel);
  return {
    normalized: {
      ...normalized.entities,
    },
  } as RootState;
}
