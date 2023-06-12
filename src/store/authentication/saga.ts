import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, all, spawn } from 'redux-saga/effects';
import { SagaActionTypes, setUser } from '.';
import { SagaActionTypes as ChannelsListSagaActionTypes } from '../channels-list';
import {
  nonceOrAuthorize as nonceOrAuthorizeApi,
  fetchCurrentUser,
  clearSession as clearSessionApi,
  fetchChatAccessToken,
  emailLogin as apiEmailLogin,
} from './api';
import { setChatAccessToken } from '../chat';
import { User } from './types';
import { clearUserLayout, initializePublicLayout, initializeUserLayout } from '../layout/saga';
import { fetch as fetchNotifications } from '../notifications';
import { clearChannelsAndConversations } from '../channels-list/saga';
import { clearNotifications } from '../notifications/saga';
import { clearUsers } from '../users/saga';
import { clearMessages } from '../messages/saga';
import { updateConnector } from '../web3/saga';
import { Connectors } from '../../lib/web3';
import { Events, authChannel } from './channels';
import { getHistory } from '../../lib/browser';
import { featureFlags } from '../../lib/feature-flags';

export interface Payload {
  signedWeb3Token: string;
}

export const currentUserSelector = () => (state) => {
  return getDeepProperty(state, 'authentication.user.data', null);
};

export function* setAuthentication({ chatAccessToken } = { chatAccessToken: '' }) {
  yield put(setChatAccessToken({ value: chatAccessToken, isLoading: false }));
}

export function* nonceOrAuthorize(action) {
  const { signedWeb3Token } = action.payload;
  const { nonceToken: nonce = undefined, chatAccessToken } = yield call(nonceOrAuthorizeApi, signedWeb3Token);
  if (nonce) {
    yield put(setUser({ nonce }));
  } else {
    yield setAuthentication({ chatAccessToken });
    yield completeUserLogin();
  }

  return { nonce };
}

export function* completeUserLogin() {
  const user = yield call(fetchCurrentUser);
  yield put(setUser({ data: user, isLoading: false }));
  yield spawn(initializeUserState, user);
  yield publishUserLogin(user);
}

export function* terminate(isChangeAccount = false) {
  yield put(setUser({ data: null, nonce: null, isLoading: false }));
  yield put(setChatAccessToken({ value: null, isLoading: false }));
  yield spawn(clearUserState);
  yield redirectUnauthenticatedUser(isChangeAccount);
  yield publishUserLogout();

  try {
    yield call(clearSessionApi);
  } catch {
    /* No operation, if user is unauthenticated deleting the cookie fails */
  }
}

export function* getCurrentUserWithChatAccessToken() {
  try {
    const user = yield call(fetchCurrentUser);
    if (!user) {
      return false;
    }

    const { chatAccessToken } = yield call(fetchChatAccessToken);
    yield setAuthentication({ chatAccessToken });
    yield completeUserLogin();
    return true;
  } catch (e) {
    return false;
  }
}

export function* authenticateByEmail(email, password) {
  const result = yield call(apiEmailLogin, { email, password });
  if (!result.success) {
    return result;
  }
  yield setAuthentication({ chatAccessToken: result.chatAccessToken });
  yield completeUserLogin();
  return result;
}

export function* processUserAccount(params: {
  user?: User;
  nonce?: string;
  chatAccessToken?: string;
  isLoading: boolean;
}) {
  const { user = null, nonce = null, isLoading = false } = params;
  yield put({
    type: user
      ? ChannelsListSagaActionTypes.StartChannelsAndConversationsAutoRefresh
      : ChannelsListSagaActionTypes.StopChannelsAndConversationsAutoRefresh,
  });
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
  yield takeLatest(SagaActionTypes.Logout, logout);
  yield takeLatest(SagaActionTypes.FetchCurrentUserWithChatAccessToken, getCurrentUserWithChatAccessToken);
}

export function* logout() {
  yield call(updateConnector, { payload: Connectors.None });
  yield call(terminate);
}

function* publishUserLogin(user) {
  const channel = yield call(authChannel);
  yield put(channel, { type: Events.UserLogin, userId: user.id });
}

function* publishUserLogout() {
  const channel = yield call(authChannel);
  yield put(channel, { type: Events.UserLogout });
}

function* redirectUnauthenticatedUser(isChangeAccount: boolean) {
  const history = getHistory();

  if (featureFlags.allowPublicZOS) {
    yield initializePublicLayout();
  }

  if (isChangeAccount || featureFlags.allowPublicZOS) {
    history.replace({ pathname: '/' });
    return;
  }

  history.replace({ pathname: '/login' });
}
