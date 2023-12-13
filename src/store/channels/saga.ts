import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, spawn } from 'redux-saga/effects';
import { SagaActionTypes, receive, schema, removeAll } from '.';

import { joinChannel as joinChannelAPI } from './api';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { currentUserSelector } from '../authentication/saga';
import { setActiveChannelId, setactiveConversationId } from '../chat';
import { chat } from '../../lib/chat';
import { reset } from '../create-conversation/saga';

export const rawChannelSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels['${channelId}']`, null);
};

export function* joinChannel(action) {
  const { channelId } = action.payload;

  yield call(joinChannelAPI, channelId);

  yield put(
    receive({
      id: channelId,
      hasJoined: true,
    })
  );
}

export function* markAllMessagesAsRead(channelId, userId) {
  if (!userId) {
    return;
  }

  const chatClient = yield call(chat.get);
  try {
    yield call([chatClient, chatClient.markRoomAsRead], channelId, userId);

    yield put(
      receive({
        id: channelId,
        unreadCount: 0,
      })
    );
  } catch (error) {}
}

// mark all messages as read in current active channel (only if you're not in full screen mode)
export function* markChannelAsRead(channelId) {
  const currentUser = yield select(currentUserSelector());
  const isMessengerFullScreen = true; // todo: remove this function
  const channelInfo = yield select(rawChannelSelector(channelId));

  // just ensure first that you're not in full screen mode before marking all messages as read in a "channel"
  if (!isMessengerFullScreen && channelInfo?.unreadCount > 0) {
    yield call(markAllMessagesAsRead, channelId, currentUser.id);
  }
}

// mark all messages in read in current active conversation
export function* markConversationAsRead(conversationId) {
  const currentUser = yield select(currentUserSelector());
  const conversationInfo = yield select(rawChannelSelector(conversationId));
  if (conversationInfo?.unreadCount > 0) {
    yield call(markAllMessagesAsRead, conversationId, currentUser.id);
  }
}

export function* openChannel(channelId) {
  if (!channelId) {
    return;
  }

  yield put(setActiveChannelId(channelId));
  yield spawn(markChannelAsRead, channelId);
}

export function* openConversation(conversationId) {
  if (!conversationId) {
    return;
  }

  yield call(reset);
  yield put(setactiveConversationId(conversationId));
  yield spawn(markConversationAsRead, conversationId);
}

export function* unreadCountUpdated(action) {
  const { channelId, unreadCount } = action.payload;

  const channel = yield select(rawChannelSelector(channelId));

  if (!channel) {
    return;
  }

  yield put(
    receive({
      id: channelId,
      unreadCount: unreadCount,
    })
  );
}

export function* clearChannels() {
  yield put(removeAll({ schema: schema.key }));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.JoinChannel, joinChannel);
  yield takeLatest(SagaActionTypes.OpenChannel, ({ payload }: any) => openChannel(payload.channelId));
  yield takeLatest(SagaActionTypes.OpenConversation, ({ payload }: any) => openConversation(payload.conversationId));

  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.UnreadCountChanged, unreadCountUpdated);
}
