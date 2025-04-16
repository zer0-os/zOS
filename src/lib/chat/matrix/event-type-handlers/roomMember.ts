import { EventType, Membership } from 'matrix-js-sdk';
import { MatrixClient } from '../../matrix-client';
import { call, spawn } from 'redux-saga/effects';
import { batchGetUsersByMatrixId } from '../../../../store/users/saga';

type RoomMemberEvent = {
  type: EventType.RoomMember;
  state_key: string; // matrix id of the member
  content: {
    avatar_url: string;
    displayname: string;
    membership: Membership;
  };
};

export const isRoomMemberEvent = (event: unknown): event is RoomMemberEvent => {
  return typeof event === 'object' && event !== null && 'type' in event && event.type === EventType.RoomMember;
};

export function* handleRoomMemberEvent(event: RoomMemberEvent, roomId: string, client: MatrixClient) {
  const { state_key, content } = event;
  const { membership } = content;
  const isCurrentUser = state_key === client.userId;
  const isInvite = membership === 'invite';

  if (isCurrentUser && isInvite) {
    // Auto join rooms when invited.
    // Potential improvement to this would be showing buttons for accepting/rejecting invites.
    yield call([client, client.autoJoinRoom], roomId);
  }

  yield spawn(batchGetUsersByMatrixId, state_key);
}
