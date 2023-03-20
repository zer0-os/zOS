import getDeepProperty from 'lodash.get';
import { SIDEKICK_OPEN_STORAGE } from './constants';
import { put, takeLatest, select } from 'redux-saga/effects';
import { update, SagaActionTypes } from './';
import { resolveFromLocalStorageAsBoolean } from '../../lib/storage';

export const getKeyWithUserId = (key: string) => (state) => {
  const user = getDeepProperty(state, 'authentication.user.data', null);

  if (user) {
    return `${user.id}-${key}`;
  }
};

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

export function* syncSidekickState() {
  const sidekickOpenStorageWithUserId = yield select(getKeyWithUserId(SIDEKICK_OPEN_STORAGE));

  if (sidekickOpenStorageWithUserId) {
    const isSidekickOpen = resolveFromLocalStorageAsBoolean(sidekickOpenStorageWithUserId);

    yield put(
      update({
        isSidekickOpen,
      })
    );
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.updateSidekick, updateSidekick);
  yield takeLatest(SagaActionTypes.syncSidekickState, syncSidekickState);
}
