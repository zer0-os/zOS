import getDeepProperty from 'lodash.get';
import { put, takeLatest, select, call } from 'redux-saga/effects';
import { update, SagaActionTypes } from './';
import { User } from '../authentication/types';
import { openFirstConversation } from '../login/saga';
import { checkNewRewardsLoaded } from '../rewards/saga';

export const getKeyWithUserId = (key: string) => (state) => {
  const user: User = getDeepProperty(state, 'authentication.user.data', null);

  if (user) {
    return keyForUser(user.id, key);
  }
};

function keyForUser(id: string, key: string) {
  return `${id}-${key}`;
}

export function* initializeUserLayout(_user: { id: string; isAMemberOfWorlds: boolean }) {
  const isMessengerFullScreen = true; // The main app view of zOS is no longer used

  yield put(
    update({
      isMessengerFullScreen,
    })
  );
}

export function* initializePublicLayout() {
  yield put(
    update({
      isMessengerFullScreen: true,
    })
  );
}

export function* clearUserLayout() {
  yield put(
    update({
      isMessengerFullScreen: true,
    })
  );
}

export function* enterFullScreenMessenger(_action) {
  yield put(update({ isMessengerFullScreen: true }));

  yield call(checkNewRewardsLoaded);

  // open the first conversation when entering full screen
  const activeConversationId = yield select((state) => getDeepProperty(state, 'chat.activeConversationId'));
  if (!activeConversationId) {
    yield call(openFirstConversation);
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.enterFullScreenMessenger, enterFullScreenMessenger);
}
