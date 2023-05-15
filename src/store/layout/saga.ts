import getDeepProperty from 'lodash.get';
import { SIDEKICK_OPEN_STORAGE } from './constants';
import { put, takeLatest, select } from 'redux-saga/effects';
import { update, SagaActionTypes } from './';
import { resolveFromLocalStorageAsBoolean } from '../../lib/storage';
import { User } from '../authentication/types';

export const getKeyWithUserId = (key: string) => (state) => {
  const user: User = getDeepProperty(state, 'authentication.user.data', null);

  if (user) {
    return keyForUser(user.id, key);
  }
};

function keyForUser(id: string, key: string) {
  return `${id}-${key}`;
}

export function* updateSidekick(action) {
  const { isOpen } = action.payload;

  const sidekickOpenStorageWithUserId = yield select(getKeyWithUserId(SIDEKICK_OPEN_STORAGE));

  if (sidekickOpenStorageWithUserId) {
    localStorage.setItem(sidekickOpenStorageWithUserId, isOpen);

    yield put(
      update({
        isSidekickOpen: isOpen,
      })
    );
  }
}

export function* initializeUserLayout(user: { id: string; isAMemberOfWorlds: boolean }) {
  const isSidekickOpen = resolveFromLocalStorageAsBoolean(keyForUser(user.id, SIDEKICK_OPEN_STORAGE), true);
  const isMessengerFullScreen = !user.isAMemberOfWorlds;

  yield put(
    update({
      isSidekickOpen,
      isMessengerFullScreen,
    })
  );
}

export function* clearUserLayout() {
  yield put(
    update({
      isSidekickOpen: false,
      isMessengerFullScreen: false,
    })
  );
}

export function* saga() {
  yield takeLatest(SagaActionTypes.updateSidekick, updateSidekick);
}
