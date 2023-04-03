import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, all, spawn } from 'redux-saga/effects';
import { SagaActionTypes, setUser } from '.';
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

export interface Payload {
  signedWeb3Token: string;
}

export const currentUserSelector = () => (state) => {
  return getDeepProperty(state, 'authentication.user.data', null);
};

export function* nonceOrAuthorize(action) {
  yield setUserAndChatAccessToken({ user: null, nonce: null, chatAccessToken: null, isLoading: true });

  const { signedWeb3Token } = action.payload;

  const { nonceToken: nonce = undefined, chatAccessToken } = yield call(nonceOrAuthorizeApi, signedWeb3Token);

  if (nonce) {
    yield put(setUser({ nonce, isLoading: false }));
  } else {
    const user = yield call(fetchCurrentUser);

    yield setUserAndChatAccessToken({ user, chatAccessToken, isLoading: false });
  }
}

export function* terminate() {
  try {
    yield call(clearSessionApi);
  } catch {
    /* No operation, if user is unauthenticated deleting the cookie fails */
  }

  yield setUserAndChatAccessToken({ user: null, nonce: null, chatAccessToken: null, isLoading: false });
}

export function* getCurrentUserWithChatAccessToken() {
  yield setUserAndChatAccessToken({ user: null, chatAccessToken: null, isLoading: true });

  const user = yield call(fetchCurrentUser);

  if (user) {
    const { chatAccessToken } = yield call(fetchChatAccessToken);

    yield setUserAndChatAccessToken({ user, chatAccessToken, isLoading: false });
  } else {
    yield setUserAndChatAccessToken({ isLoading: false });
  }
}

function* setUserAndChatAccessToken(params: {
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
  yield clearUserLayout();
}

export function* saga() {
  yield takeLatest(SagaActionTypes.NonceOrAuthorize, nonceOrAuthorize);
  yield takeLatest(SagaActionTypes.Terminate, terminate);
  yield takeLatest(SagaActionTypes.FetchCurrentUserWithChatAccessToken, getCurrentUserWithChatAccessToken);
}
