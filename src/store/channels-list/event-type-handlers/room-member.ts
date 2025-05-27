import { EventType, Membership } from 'matrix-js-sdk';
import { MatrixClient } from '../../../lib/chat/matrix-client';
import { call, select, spawn } from 'redux-saga/effects';
import { batchGetUsersByMatrixId } from '../../users/saga';
import { roomMemberUpdated } from '../saga';
import { activeConversationIdSelector } from '../../chat/selectors';
import { scheduleActiveChannelMessageUpdate } from '../../messages/saga';

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

  yield spawn(roomMemberUpdated, roomId);
  yield spawn(batchGetUsersByMatrixId, state_key);
  const activeConversationId = yield select(activeConversationIdSelector);
  if (activeConversationId === roomId) {
    yield spawn(scheduleActiveChannelMessageUpdate, roomId);
  }
}
