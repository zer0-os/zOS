import { EventType } from 'matrix-js-sdk';
import { put, select } from 'redux-saga/effects';
import { MSC3575RoomData } from 'matrix-js-sdk/lib/sliding-sync';
import { receive } from '../../channels';
import { rawChannel } from '../../channels/selectors';

type RoomMessageEvent = {
  type: EventType.RoomMessage | EventType.RoomMessageEncrypted;
};

export const isRoomMessageEvent = (event: unknown): event is RoomMessageEvent => {
  return (
    typeof event === 'object' &&
    event !== null &&
    'type' in event &&
    (event.type === EventType.RoomMessage || event.type === EventType.RoomMessageEncrypted)
  );
};

export function* handleRoomMessageEvent(_event: RoomMessageEvent, roomId: string, roomData: MSC3575RoomData) {
  const channel = yield select((state) => rawChannel(state, roomId));
  if (channel.bumpStamp === roomData.bump_stamp) return;

  // Ensure the bump stamp is updated when new messages are received
  yield put(
    receive({
      id: roomId,
      bumpStamp: roomData.bump_stamp,
    })
  );
}
