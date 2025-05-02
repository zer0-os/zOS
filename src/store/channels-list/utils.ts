import { Channel, User } from './../channels/index';
import { MSC3575RoomData } from 'matrix-js-sdk/lib/sliding-sync';
import { MatrixAdapter } from '../../lib/chat/matrix/matrix-adapter';
import Matrix from '../../lib/chat/matrix/matrix-client-instance';
import { EventType, IEvent } from 'matrix-js-sdk/lib/matrix';
import { MatrixConstants } from '../../lib/chat/matrix/types';
import { mapMessagesAndPreview } from '../messages/saga';
import { call } from 'redux-saga/effects';
import { getUserSubHandle } from '../../lib/user';
import { Message } from '../messages';

export const isOneOnOne = (channel: { totalMembers: number }) => channel.totalMembers === 2;

export function byBumpStamp(a: { bumpStamp: number }, b: { bumpStamp: number }) {
  return b.bumpStamp - a.bumpStamp;
}

export function rawUserToDomainUser(u): User {
  return {
    userId: u.id,
    matrixId: u.matrixId,
    profileId: u.profileId,
    isOnline: false,
    firstName: u.profileSummary?.firstName,
    lastName: u.profileSummary?.lastName,
    profileImage: u.profileSummary?.profileImage,
    lastSeenAt: u.lastActiveAt,
    primaryZID: u.primaryZID,
    primaryWallet: u.primaryWallet,
    wallets: u.wallets,
    displaySubHandle: getUserSubHandle(u.primaryZID, u.primaryWallet?.publicAddress),
  };
}

export function* updateChannelWithRoomData(roomId: string, roomData: MSC3575RoomData) {
  const room = Matrix.client.getRoom(roomId);
  if (!room) return null;
  const baseChannel = MatrixAdapter.mapRoomToChannel(room);

  const initialChannelUpdates: Partial<Channel> = {};

  const liveTimeline = room.getLiveTimeline();
  const timelineEvents = liveTimeline.getEvents();
  const timeline = timelineEvents.reduce<IEvent[]>((acc, event) => {
    if (event.getType() === EventType.RoomMessageEncrypted) {
      Matrix.client.decryptEventIfNeeded(event);
      const evt = event.getEffectiveEvent();
      // Handle edited messages
      const relatesTo = evt.content[MatrixConstants.RELATES_TO];
      let id = evt.event_id;
      if (relatesTo && relatesTo.rel_type === MatrixConstants.REPLACE) {
        id = relatesTo.event_id;
      }
      // Only add the placeholder event if it's not already in the timeline (to avoid duplicates from edits)
      if (acc.find((e) => e.event_id === id)) {
        return acc;
      }
      acc.push({
        ...evt,
        event_id: id,
        content: { body: 'Decrypting...', msgtype: 'm.text' },
      });
    } else {
      acc.push(event.getEffectiveEvent());
    }
    return acc;
  }, []);

  // TODO zos-619: This should be in MatrixAdapter and not on the matrix client instance
  let messages = Matrix.client.processRawEventsToMessages(timeline);
  messages = yield call(mapMessagesAndPreview, messages, roomId);
  const lastRoomMessage = [...messages].reverse().find((m: Message) => !m.admin) ?? null;
  let lastMessage = baseChannel.lastMessage;
  if (lastRoomMessage) {
    lastMessage = lastRoomMessage;
  }

  initialChannelUpdates.messages = messages;
  initialChannelUpdates.lastMessage = lastMessage;

  return {
    ...baseChannel,
    bumpStamp: roomData.bump_stamp,
    ...initialChannelUpdates,
  };
}
