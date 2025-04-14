import { createNormalizedListSlice } from '../normalized';
import { Channel } from '../channels';
import { schema } from '../channels';
import { toSimplifiedUser } from '../users/utils';
import { SimplifiedUser } from '../users/types';

// ChannelsList has been deprecated. We're now using the Channels slice instead.
// This is still in place while we migrate the codebase to the new slice.
const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { receiveNormalized, setStatus, receive: rawReceive } = slice.actions;
export const receive = (channels: string[] | Channel[]) => {
  // Simplifying users when saving to control update flow. See `store/users/utils.ts` for more details.
  return rawReceive(
    channels.map((channel: string | Partial<Channel>) => {
      if (typeof channel === 'string') {
        return channel;
      }
      // TODO zos-619: Ensure this is actually needed
      // @ts-ignore - Removing denormalized flag
      const { __denormalized, otherMembers, memberHistory, ...rest } = channel;
      const simplifiedUsers: { otherMembers?: SimplifiedUser[]; memberHistory?: SimplifiedUser[] } = {};
      if (otherMembers) {
        simplifiedUsers.otherMembers = otherMembers.map(toSimplifiedUser);
      }
      if (memberHistory) {
        simplifiedUsers.memberHistory = memberHistory.map(toSimplifiedUser);
      }
      return {
        ...rest,
        ...simplifiedUsers,
      };
    })
  );
};
export const { reducer, normalize, denormalize } = slice;
