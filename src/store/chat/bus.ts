import { eventChannel, multicastChannel } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { Chat } from '../../lib/chat';

export enum Events {
  MessageReceived = 'chat/message/received',
  MessageUpdated = 'chat/message/updated',
  MessageDeleted = 'chat/message/deleted',
  UnreadCountChanged = 'chat/message/unreadCountChanged',
  InvalidToken = 'chat/invalidToken',
  ChannelInvitationReceived = 'chat/channel/invitationReceived',
  UserLeftChannel = 'chat/channel/userLeft',
  UserJoinedChannel = 'chat/channel/userJoined',
  UserPresenceChanged = 'chat/user/presenceChanged',
  RoomNameChanged = 'chat/roomNameChanged',
  RoomAvatarChanged = 'chat/roomAvatarChanged',
  OtherUserJoinedChannel = 'chat/channel/otherUserJoined',
  OtherUserLeftChannel = 'chat/channel/otherUserLeft',
  LiveRoomEventReceived = 'chat/message/liveRoomEventReceived',
  ChatConnectionComplete = 'chat/connection/complete',
  RoomFavorited = 'chat/channel/roomFavorited',
  RoomUnfavorited = 'chat/channel/roomUnfavorited',
}

let theBus;
export function* getChatBus() {
  if (!theBus) {
    theBus = yield call(multicastChannel);
  }
  return theBus;
}

export function createChatConnection(userId, chatAccessToken, chatClient: Chat) {
  let setActivationResult = null;
  let connectionPromise;
  const chatConnection = eventChannel((rawEmit) => {
    const activationPromise = new Promise((resolve) => {
      setActivationResult = (result) => resolve(result);
    });

    const queuedEvents = [];
    let queueing = true;
    const processQueuePromise = new Promise(async (resolve) => {
      await activationPromise;
      queueing = false;
      await Promise.all(queuedEvents);
      rawEmit({ type: Events.ChatConnectionComplete });
      resolve(null);
    });

    const emit = async (event) => {
      if (queueing) {
        queuedEvents.push(queuedEmit(event));
      } else {
        await processQueuePromise;
        rawEmit(event);
      }
    };

    async function queuedEmit(event) {
      const activated = await activationPromise;
      if (activated) {
        // This may not be necessary as the eventChannel stops broadcasting
        // when the it's closed so we could just do this willy nilly.
        rawEmit(event);
      }
    }

    const receiveNewMessage = (channelId, message) =>
      emit({ type: Events.MessageReceived, payload: { channelId, message } });
    const onMessageUpdated = (channelId, message) =>
      emit({ type: Events.MessageUpdated, payload: { channelId, message } });
    const receiveDeleteMessage = (channelId, messageId) =>
      emit({ type: Events.MessageDeleted, payload: { channelId, messageId } });
    const receiveUnreadCount = (channelId, unreadCount) =>
      emit({ type: Events.UnreadCountChanged, payload: { channelId, unreadCount } });
    const onUserLeft = (channelId, userId) => emit({ type: Events.UserLeftChannel, payload: { channelId, userId } });
    const onUserJoinedChannel = (channel) => emit({ type: Events.UserJoinedChannel, payload: { channel } });
    const onUserPresenceChanged = (matrixId, isOnline, lastSeenAt) =>
      emit({ type: Events.UserPresenceChanged, payload: { matrixId, isOnline, lastSeenAt } });
    const onRoomNameChanged = (roomId, name) => emit({ type: Events.RoomNameChanged, payload: { id: roomId, name } });
    const onRoomAvatarChanged = (roomId, url) => emit({ type: Events.RoomAvatarChanged, payload: { id: roomId, url } });
    const onOtherUserJoinedChannel = (channelId, user) =>
      emit({ type: Events.OtherUserJoinedChannel, payload: { channelId, user } });
    const onOtherUserLeftChannel = (channelId, user) =>
      emit({ type: Events.OtherUserLeftChannel, payload: { channelId, user } });
    const receiveLiveRoomEvent = (eventData) => emit({ type: Events.LiveRoomEventReceived, payload: { eventData } });
    const roomFavorited = (roomId) => emit({ type: Events.RoomFavorited, payload: { roomId } });
    const roomUnfavorited = (roomId) => emit({ type: Events.RoomUnfavorited, payload: { roomId } });

    chatClient.initChat({
      receiveNewMessage,
      onMessageUpdated,
      receiveDeleteMessage,
      receiveUnreadCount,
      onUserLeft,
      onUserJoinedChannel,
      onUserPresenceChanged,
      onRoomNameChanged,
      onRoomAvatarChanged,
      onOtherUserJoinedChannel,
      onOtherUserLeftChannel,
      receiveLiveRoomEvent,
      roomFavorited,
      roomUnfavorited,
    });

    connectionPromise = chatClient.connect(userId, chatAccessToken);

    const unsubscribe = async () => {
      setActivationResult(false);
      await chatClient.disconnect();
    };
    return unsubscribe;
  });

  return { chatConnection, connectionPromise, activate: () => setActivationResult(true) };
}
