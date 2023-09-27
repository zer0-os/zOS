import { eventChannel, multicastChannel } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { chat } from '../../lib/chat';

export enum Events {
  MessageReceived = 'chat/message/received',
  MessageUpdated = 'chat/message/updated',
  MessageDeleted = 'chat/message/deleted',
  UnreadCountChanged = 'chat/message/unreadCountChanged',
  ReconnectStart = 'chat/reconnectStart',
  ReconnectStop = 'chat/reconnectStop',
  InvalidToken = 'chat/invalidToken',
  ChannelInvitationReceived = 'chat/channel/invitationReceived',
  UserLeftChannel = 'chat/channel/userLeft',
  UserJoinedChannel = 'chat/channel/userJoined',
  ConversationListChanged = 'chat/conversationListChanged',
  UserPresenceChanged = 'chat/user/presenceChanged',
  RoomNameChanged = 'chat/roomNameChanged',
}

let theBus;
export function* getChatBus() {
  if (!theBus) {
    theBus = yield call(multicastChannel);
  }
  return theBus;
}

export function createChatConnection(userId, chatAccessToken) {
  const chatClient = chat.get();

  return eventChannel((emit) => {
    const receiveNewMessage = (channelId, message) =>
      emit({ type: Events.MessageReceived, payload: { channelId, message } });
    const onMessageUpdated = (channelId, message) =>
      emit({ type: Events.MessageUpdated, payload: { channelId, message } });
    const receiveDeleteMessage = (channelId, messageId) =>
      emit({ type: Events.MessageDeleted, payload: { channelId, messageId } });
    const receiveUnreadCount = (channelId, unreadCount) =>
      emit({ type: Events.UnreadCountChanged, payload: { channelId, unreadCount } });
    const reconnectStart = () => emit({ type: Events.ReconnectStart, payload: {} });
    const reconnectStop = () => emit({ type: Events.ReconnectStop, payload: {} });
    const invalidChatAccessToken = () => emit({ type: Events.InvalidToken, payload: {} });
    const onUserReceivedInvitation = (channelId) =>
      emit({ type: Events.ChannelInvitationReceived, payload: { channelId } });
    const onUserLeft = (channelId, userId) => emit({ type: Events.UserLeftChannel, payload: { channelId, userId } });
    const onUserJoinedChannel = (channel) => emit({ type: Events.UserJoinedChannel, payload: { channel } });
    const onConversationListChanged = (conversationIds) =>
      emit({ type: Events.ConversationListChanged, payload: { conversationIds } });
    const onUserPresenceChanged = (matrixId, isOnline, lastSeenAt) =>
      emit({ type: Events.UserPresenceChanged, payload: { matrixId, isOnline, lastSeenAt } });
    const onRoomNameChanged = (roomId, name) => emit({ type: Events.RoomNameChanged, payload: { id: roomId, name } });

    chatClient.initChat({
      reconnectStart,
      reconnectStop,
      receiveNewMessage,
      onMessageUpdated,
      receiveDeleteMessage,
      receiveUnreadCount,
      invalidChatAccessToken,
      onUserReceivedInvitation,
      onUserLeft,
      onUserJoinedChannel,
      onConversationListChanged,
      onUserPresenceChanged,
      onRoomNameChanged,
    });
    chatClient.connect(userId, chatAccessToken);

    const unsubscribe = () => {
      chatClient.disconnect();
    };
    return unsubscribe;
  });
}
