import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, all, spawn } from 'redux-saga/effects';
import { SagaActionTypes, setUser } from '.';
import { SagaActionTypes as ChannelsListSagaActionTypes } from '../channels-list';
import {
  nonceOrAuthorize as nonceOrAuthorizeApi,
  fetchCurrentUser,
  clearSession as clearSessionApi,
  fetchChatAccessToken,
} from './api';
import { setChatAccessToken } from '../chat';
import { User } from './types';
import { clearUserLayout, initializeUserLayout } from '../layout/saga';
import { fetch as fetchNotifications } from '../notifications';
import { clearChannelsAndConversations } from '../channels-list/saga';
import { clearNotifications } from '../notifications/saga';
import { clearUsers } from '../users/saga';
import { clearMessages } from '../messages/saga';

export interface Payload {
  signedWeb3Token: string;
}

export const currentUserSelector = () => (state) => {
  return getDeepProperty(state, 'authentication.user.data', null);
};

export function* nonceOrAuthorize(action) {
  yield processUserAccount({ user: null, nonce: null, chatAccessToken: null, isLoading: true });

  const { signedWeb3Token } = action.payload;

  const { nonceToken: nonce = undefined, chatAccessToken } = yield call(nonceOrAuthorizeApi, signedWeb3Token);

  if (nonce) {
    yield put(setUser({ nonce, isLoading: false }));
  } else {
    const user = yield call(fetchCurrentUser);

    yield processUserAccount({ user, chatAccessToken, isLoading: false });
  }
}

export function* terminate() {
  try {
    yield call(clearSessionApi);
  } catch {
    /* No operation, if user is unauthenticated deleting the cookie fails */
  }

  yield processUserAccount({ user: null, nonce: null, chatAccessToken: null, isLoading: false });
}

export function* getCurrentUserWithChatAccessToken() {
  yield processUserAccount({ user: null, chatAccessToken: null, isLoading: true });

  const user = yield call(fetchCurrentUser);

  if (user) {
    const { chatAccessToken } = yield call(fetchChatAccessToken);

    yield processUserAccount({ user, chatAccessToken, isLoading: false });
  } else {
    yield processUserAccount({ isLoading: false });
  }
}

export function* processUserAccount(params: {
  user?: User;
  nonce?: string;
  chatAccessToken?: string;
  isLoading: boolean;
}) {
  const { user = null, nonce = null, chatAccessToken = null, isLoading = false } = params;

  yield all([
    put(
      setUser({
        data: user,
        nonce,
        isLoading,
      })
    ),
    put(
      setChatAccessToken({
        value: chatAccessToken,
        isLoading,
      })
    ),
  ]);

  if (isLoading) return;

  yield put({
    type: user
      ? ChannelsListSagaActionTypes.StartChannelsAndConversationsAutoRefresh
      : ChannelsListSagaActionTypes.StopChannelsAndConversationsAutoRefresh,
  });

  if (user) {
    yield spawn(initializeUserState, user);
  } else {
    yield spawn(clearUserState);
  }
}

export function* initializeUserState(user: User) {
  yield initializeUserLayout(user);

  yield put(
    fetchNotifications({
      userId: user.id,
    })
  );
}

export function* clearUserState() {
  yield all([
    call(clearChannelsAndConversations),
    call(clearMessages),
    call(clearUsers),
    call(clearNotifications),
    call(clearUserLayout),
  ]);
}

export function* saga() {
  yield takeLatest(SagaActionTypes.NonceOrAuthorize, nonceOrAuthorize);
  yield takeLatest(SagaActionTypes.Terminate, terminate);
  yield takeLatest(SagaActionTypes.FetchCurrentUserWithChatAccessToken, getCurrentUserWithChatAccessToken);
}
