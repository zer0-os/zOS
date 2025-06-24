import { takeLatest, put, call, all, delay, spawn } from 'redux-saga/effects';
import { SagaActionTypes, setDisplayLogoutModal, setUser, refreshCurrentUser } from '.';
import {
  nonceOrAuthorize as nonceOrAuthorizeApi,
  fetchCurrentUser,
  clearSession as clearSessionApi,
  emailLogin as apiEmailLogin,
  oauthLogin as apiOAuthLogin,
} from './api';
import { clearChannelsAndConversations } from '../channels-list/saga';
import { clearUsers } from '../users/saga';
import { clearMessages } from '../messages/saga';
import { Events, getAuthChannel } from './channels';
import { getHistory } from '../../lib/browser';
import { completePendingUserProfile } from '../registration/saga';
import { closeUserProfile } from '../user-profile/saga';
import { clearLastActiveConversation } from '../../lib/last-conversation';
import { clearLastActiveTab } from '../../lib/last-tab';
import { clearRewards } from '../rewards/saga';
import { clearLastActiveFeed } from '../../lib/last-feed';
import { clearLastFeedFilter } from '../../lib/last-feed-filter';
import { clearCache, performCacheMaintenance } from '../../lib/storage/media-cache';
import { setSentryUser } from '../../utils';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { takeEveryFromBus } from '../../lib/saga';

export function* nonceOrAuthorize(action) {
  const { signedWeb3Token } = action.payload;
  const { nonceToken: nonce = undefined } = yield call(nonceOrAuthorizeApi, signedWeb3Token);
  if (nonce) {
    yield put(setUser({ nonce, data: null }));
  } else {
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
  yield call(publishUserLogin, user);
  yield spawn(scheduleCacheMaintenance);
}

export function* terminate(isAccountChange = false) {
  yield put(setUser({ data: null, nonce: null }));

  try {
    yield call(clearSessionApi);
  } catch {
    /* No operation, if user is unauthenticated deleting the cookie fails */
  }

  yield call(clearUserState);
  yield call(redirectUnauthenticatedUser, isAccountChange);
  yield call(publishUserLogout);
}

export function* getCurrentUser() {
  try {
    const user = yield call(fetchCurrentUser);
    if (!user) {
      return { success: false, error: 'unauthenticated' };
    }

    yield completeUserLogin(user);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'critical' };
  }
}

export function* authenticateByEmail(email, password) {
  const result = yield call(apiEmailLogin, { email, password });
  if (!result.success) {
    return result;
  }
  yield call(completeUserLogin);
  return result;
}

export function* authenticateByOAuth(sessionToken: string) {
  const result = yield call(apiOAuthLogin, { sessionToken });
  if (!result.success) {
    return result;
  }
  yield call(completeUserLogin);
  return result;
}

export function* clearUserState() {
  // Note: This should probably all live in the appropriate areas and listen to the logout event
  yield all([
    call(clearChannelsAndConversations),
    call(clearMessages),
    call(clearUsers),
    call(closeUserProfile),
    call(clearCache),
  ]);
}

const CACHE_MAINTENANCE_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours

export function* scheduleCacheMaintenance() {
  while (true) {
    yield delay(CACHE_MAINTENANCE_INTERVAL);

    try {
      yield call(performCacheMaintenance);
    } catch (e) {
      console.error('Error during cache maintenance:', e);
    }
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Logout, logoutRequest);
  yield takeLatest(SagaActionTypes.ForceLogout, forceLogout);
  yield takeLatest(SagaActionTypes.CloseLogoutModal, closeLogoutModal);
  yield takeLatest(refreshCurrentUser.type, getCurrentUser);

  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, ChatEvents.InvalidToken, forceLogout);
}

export function* logoutRequest() {
  yield put(setDisplayLogoutModal(true));
}

export function* closeLogoutModal() {
  yield put(setDisplayLogoutModal(false));
}

export function* forceLogout() {
  yield closeLogoutModal();
  yield call(clearLastActiveConversation);
  yield call(clearLastActiveTab);
  yield call(clearLastActiveFeed);
  yield call(clearLastFeedFilter);
  yield call(clearRewards);
  yield call(terminate);
}

export function* publishUserLogin(user) {
  const channel = yield call(getAuthChannel);
  yield put(channel, { type: Events.UserLogin, userId: user.id });
  yield call(setSentryUser, user.id);
}

export function* publishUserLogout() {
  const channel = yield call(getAuthChannel);
  yield put(channel, { type: Events.UserLogout });
  yield call(setSentryUser, null);
}

export function* redirectUnauthenticatedUser(isAccountChange: boolean) {
  const history = getHistory();

  if (isAccountChange) {
    history.replace({ pathname: '/' });
    return;
  }

  yield history.replace({ pathname: '/login' });
}
