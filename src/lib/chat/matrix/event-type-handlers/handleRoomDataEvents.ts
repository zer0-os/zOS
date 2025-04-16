import { MSC3575RoomData } from 'matrix-js-sdk/lib/sliding-sync';
import { MatrixClient } from '../../matrix-client';
import { isGroupTypeEvent } from './groupType';
import { isRoomMemberEvent } from './roomMember';
import { handleGroupTypeEvent } from './groupType';
import { handleRoomMemberEvent } from './roomMember';

export function* handleRoomDataEvents(roomId: string, roomData: MSC3575RoomData, client: MatrixClient) {
  const room = client.matrix.getRoom(roomId);
  if (!room) return;

  for (const event of roomData.required_state) {
    if (isGroupTypeEvent(event)) {
      yield* handleGroupTypeEvent(event, roomId);
    }

    if (isRoomMemberEvent(event)) {
      yield* handleRoomMemberEvent(event, roomId, client);
    }
  }
}
