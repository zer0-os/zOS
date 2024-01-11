import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, all } from 'redux-saga/effects';
import { SagaActionTypes, setUser } from '.';
import {
  nonceOrAuthorize as nonceOrAuthorizeApi,
  fetchCurrentUser,
  clearSession as clearSessionApi,
  fetchChatAccessToken,
  emailLogin as apiEmailLogin,
} from './api';
import { setChatAccessToken } from '../chat';
import { User } from './types';
import { clearUserLayout, initializeUserLayout } from '../layout/saga';
import { clearChannelsAndConversations } from '../channels-list/saga';
import { clearUsers } from '../users/saga';
import { clearMessages } from '../messages/saga';
import { updateConnector } from '../web3/saga';
import { Connectors } from '../../lib/web3';
import { Events, getAuthChannel } from './channels';
import { getHistory } from '../../lib/browser';
import { completePendingUserProfile } from '../registration/saga';

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
    yield put(setUser({ nonce, data: null }));
  } else {
    yield setAuthentication({ chatAccessToken });
    yield call(completeUserLogin);
  }

  return { nonce };
}

export function* completeUserLogin(user = null) {
  if (!user) {
    user = yield call(fetchCurrentUser);
  }

  if (user.isPending) {
    yield call(completePendingUserProfile, user);
    return;
  }

  yield put(setUser({ data: user }));
  yield call(initializeUserState, user);
  yield call(publishUserLogin, user);
}

export function* terminate(isAccountChange = false) {
  yield put(setUser({ data: null, nonce: null }));
  yield put(setChatAccessToken({ value: null, isLoading: false }));

  try {
    yield call(clearSessionApi);
  } catch {
    /* No operation, if user is unauthenticated deleting the cookie fails */
  }

  yield call(clearUserState);
  yield call(redirectUnauthenticatedUser, isAccountChange);
  yield call(publishUserLogout);
}

export function* getCurrentUserWithChatAccessToken() {
  try {
    const user = yield call(fetchCurrentUser);
    if (!user) {
      return false;
    }

    const { chatAccessToken } = yield call(fetchChatAccessToken);
    yield setAuthentication({ chatAccessToken });
    yield completeUserLogin(user);
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
  yield call(setAuthentication, { chatAccessToken: result.response.chatAccessToken });
  yield call(completeUserLogin);
  return result;
}

export function* initializeUserState(user: User) {
  // Note: This should probably all live in the appropriate areas and listen to the logout event
  yield initializeUserLayout(user);
}

export function* clearUserState() {
  // Note: This should probably all live in the appropriate areas and listen to the logout event
  yield all([
    call(clearChannelsAndConversations),
    call(clearMessages),
    call(clearUsers),
    call(clearUserLayout),
  ]);
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Logout, logout);
}

export function* logout() {
  yield call(updateConnector, { payload: Connectors.None });
  yield call(terminate);
}

export function* publishUserLogin(user) {
  const channel = yield call(getAuthChannel);
  yield put(channel, { type: Events.UserLogin, userId: user.id });
}

export function* publishUserLogout() {
  const channel = yield call(getAuthChannel);
  yield put(channel, { type: Events.UserLogout });
}

export function* redirectUnauthenticatedUser(isAccountChange: boolean) {
  const history = getHistory();

  if (isAccountChange) {
    history.replace({ pathname: '/' });
    return;
  }

  yield history.replace({ pathname: '/login' });
}
