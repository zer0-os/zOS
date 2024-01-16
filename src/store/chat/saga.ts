import { put, select, call, take, takeEvery, spawn, race, takeLatest, all } from 'redux-saga/effects';
import { takeEveryFromBus } from '../../lib/saga';

import { setActiveConversationId, setIsConversationErrorDialogOpen, SagaActionTypes } from '.';
import { createChatConnection, getChatBus } from './bus';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { getSSOToken } from '../authentication/api';
import { currentUserSelector } from '../authentication/saga';
import { saveUserMatrixCredentials } from '../edit-profile/saga';
import { receive } from '../users';
import { chat } from '../../lib/chat';
import { ConversationEvents, getConversationsBus } from '../channels-list/channels';
import { getHistory } from '../../lib/browser';
import { activeConversationIdSelector } from './selectors';
import { openFirstConversation } from '../channels/saga';
import { rawConversationsList, waitForChannelListLoad } from '../channels-list/saga';
import { channelListStatus } from '../channels-list/selectors';
import { AsyncListStatus } from '../normalized';

function* initChat(userId, chatAccessToken) {
  const { chatConnection, connectionPromise, activate } = createChatConnection(userId, chatAccessToken, chat.get());
  const id = yield connectionPromise;
  if (id !== userId) {
    yield call(saveUserMatrixCredentials, id, 'not-used');
  }
  yield takeEvery(chatConnection, convertToBusEvents);

  yield spawn(closeConnectionOnLogout, chatConnection);
  yield spawn(activateWhenConversationsLoaded, activate);
}

function* convertToBusEvents(action) {
  const chatBus = yield call(getChatBus);
  yield put(chatBus, action);
}

function* connectOnLogin() {
  yield take(yield call(getAuthChannel), AuthEvents.UserLogin);
  const user = yield select(currentUserSelector());
  const userId = user.matrixId;
  const token = yield call(getSSOToken);
  const chatAccessToken = token.token;

  yield initChat(userId, chatAccessToken);
}

function* closeConnectionOnLogout(chatConnection) {
  yield take(yield call(getAuthChannel), AuthEvents.UserLogout);
  chatConnection.close();
  yield spawn(connectOnLogin);
}

function* activateWhenConversationsLoaded(activate) {
  const { conversationsLoaded } = yield race({
    conversationsLoaded: take(yield call(getConversationsBus), ConversationEvents.ConversationsLoaded),
    abort: take(yield call(getAuthChannel), AuthEvents.UserLogout),
  });

  if (conversationsLoaded) {
    activate();
  } // else: abort. noop. Just stop listening for events.
}

function* clearOnLogout() {
  yield put(setActiveConversationId(null));
}

function* addAdminUser() {
  yield put(receive({ userId: 'admin', firstName: 'Admin', profileImage: null, matrixId: 'admin' }));
}

// The selected conversation is managed via the URL
export function* setActiveConversation(id: string) {
  const history = yield call(getHistory);
  history.push({ pathname: `/conversation/${id}` });
}

export function* validateActiveConversation() {
  const isLoaded = yield call(waitForChannelListLoad);
  if (isLoaded) {
    yield call(performValidateActiveConversation);
  }
}

export function* performValidateActiveConversation() {
  const [conversationList, activeConversationId] = yield all([
    select(rawConversationsList()),
    select(activeConversationIdSelector),
  ]);

  if (!activeConversationId) {
    yield put(setIsConversationErrorDialogOpen(false));
    return;
  }

  const isMemberOfActiveConversation = conversationList.includes(activeConversationId);
  yield put(setIsConversationErrorDialogOpen(!isMemberOfActiveConversation));
}

export function* closeErrorDialog() {
  yield put(setIsConversationErrorDialogOpen(false));
  yield call(openFirstConversation);
}

export function* saga() {
  yield spawn(connectOnLogin);
  yield takeLatest(setActiveConversationId.type, validateActiveConversation);

  const authBus = yield call(getAuthChannel);
  yield takeEveryFromBus(authBus, AuthEvents.UserLogout, clearOnLogout);
  yield takeEveryFromBus(authBus, AuthEvents.UserLogin, addAdminUser);

  yield takeLatest(SagaActionTypes.CloseConversationErrorDialog, closeErrorDialog);
}
