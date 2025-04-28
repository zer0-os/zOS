import { MSC3575RoomData } from 'matrix-js-sdk/lib/sliding-sync';
import { MatrixClient } from '../../../lib/chat/matrix-client';
import { isGroupTypeEvent, handleGroupTypeEvent } from './group-type';
import { isRoomMemberEvent, handleRoomMemberEvent } from './room-member';
import { handleRoomMessageEvent, isRoomMessageEvent } from './room-message';
import { spawn } from 'redux-saga/effects';

export function* handleRoomDataEvents(roomId: string, roomData: MSC3575RoomData, client: MatrixClient) {
  const room = client.matrix.getRoom(roomId);
  if (!room) return;

  for (const event of roomData.required_state) {
    if (isGroupTypeEvent(event)) {
      yield spawn(handleGroupTypeEvent, event, roomId);
    }

    if (isRoomMemberEvent(event)) {
      yield spawn(handleRoomMemberEvent, event, roomId, client);
    }
  }

  // Initial sync handling is done in the saga batchedRoomDataAction as there can be large
  // amounts of events coming through at once. This is for incremental event handling
  if (!roomData.initial) {
    for (const event of roomData.timeline) {
      if (isRoomMessageEvent(event)) {
        yield spawn(handleRoomMessageEvent, event, roomId, roomData);
      }
    }
  }
}
