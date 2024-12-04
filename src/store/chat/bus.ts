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
  RoomNameChanged = 'chat/roomNameChanged',
  RoomAvatarChanged = 'chat/roomAvatarChanged',
  RoomGroupTypeChanged = 'chat/roomGroupTypeChanged',
  OtherUserJoinedChannel = 'chat/channel/otherUserJoined',
  OtherUserLeftChannel = 'chat/channel/otherUserLeft',
  LiveRoomEventReceived = 'chat/message/liveRoomEventReceived',
  ChatConnectionComplete = 'chat/connection/complete',
  RoomMemberTyping = 'chat/channel/roomMemberTyping',
  RoomMemberPowerLevelChanged = 'chat/channel/roomMemberPowerLevelChanged',
  ReadReceiptReceived = 'chat/message/readReceiptReceived',
  RoomLabelChange = 'chat/channel/roomLabelChange',
  PostMessageReactionChange = 'chat/message/postMessageReactionChange',
  MessageEmojiReactionChange = 'chat/message/messageEmojiReactionChange',
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
      emit({
        type: Events.UnreadCountChanged,
        payload: { channelId, unreadCount: { total: unreadCount.total, highlight: unreadCount.highlight } },
      });
    const onUserLeft = (channelId, userId) => emit({ type: Events.UserLeftChannel, payload: { channelId, userId } });
    const onUserJoinedChannel = (channel) => emit({ type: Events.UserJoinedChannel, payload: { channel } });
    const onRoomNameChanged = (roomId, name) => emit({ type: Events.RoomNameChanged, payload: { id: roomId, name } });
    const onRoomAvatarChanged = (roomId, url) => emit({ type: Events.RoomAvatarChanged, payload: { id: roomId, url } });
    const onRoomGroupTypeChanged = (roomId, groupType) =>
      emit({ type: Events.RoomGroupTypeChanged, payload: { id: roomId, groupType } });
    const onOtherUserJoinedChannel = (channelId, user) =>
      emit({ type: Events.OtherUserJoinedChannel, payload: { channelId, user } });
    const onOtherUserLeftChannel = (channelId, user) =>
      emit({ type: Events.OtherUserLeftChannel, payload: { channelId, user } });
    const receiveLiveRoomEvent = (eventData) => emit({ type: Events.LiveRoomEventReceived, payload: { eventData } });
    const roomMemberTyping = (roomId, userIds) => emit({ type: Events.RoomMemberTyping, payload: { roomId, userIds } });
    const roomMemberPowerLevelChanged = (roomId, matrixId, powerLevel) =>
      emit({ type: Events.RoomMemberPowerLevelChanged, payload: { roomId, matrixId, powerLevel } });
    const readReceiptReceived = (messageId, userId, roomId) =>
      emit({ type: Events.ReadReceiptReceived, payload: { messageId, userId, roomId } });
    const roomLabelChange = (roomId, labels) => emit({ type: Events.RoomLabelChange, payload: { roomId, labels } });
    const postMessageReactionChange = (roomId, reaction) =>
      emit({ type: Events.PostMessageReactionChange, payload: { roomId, reaction } });
    const messageEmojiReactionChange = (roomId, reaction) =>
      emit({ type: Events.MessageEmojiReactionChange, payload: { roomId, reaction } });

    chatClient.initChat({
      receiveNewMessage,
      onMessageUpdated,
      receiveDeleteMessage,
      receiveUnreadCount,
      onUserLeft,
      onUserJoinedChannel,
      onRoomNameChanged,
      onRoomAvatarChanged,
      onRoomGroupTypeChanged,
      onOtherUserJoinedChannel,
      onOtherUserLeftChannel,
      receiveLiveRoomEvent,
      roomMemberTyping,
      roomMemberPowerLevelChanged,
      readReceiptReceived,
      roomLabelChange,
      postMessageReactionChange,
      messageEmojiReactionChange,
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
