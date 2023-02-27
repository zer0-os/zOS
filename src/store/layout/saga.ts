import getDeepProperty from 'lodash.get';
import { SIDEKICK_OPEN_STORAGE, SIDEKICK_TAB_KEY } from './constants';
import { put, takeLatest, select } from 'redux-saga/effects';
import { update, SagaActionTypes } from './';
import { resolveFromLocalStorageAsBoolean } from '../../lib/storage';
import { resolveActiveTab } from './utils';

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

export function* updateActiveSidekickTab(action) {
  const { activeTab } = action.payload;

  const sidekickTabKeyWithUserId = yield select(getKeyWithUserId(SIDEKICK_TAB_KEY));

  if (sidekickTabKeyWithUserId) {
    localStorage.setItem(sidekickTabKeyWithUserId, activeTab);

    yield put(
      update({
        activeSidekickTab: activeTab,
      })
    );
  }
}

export function* syncSidekickState() {
  const sidekickTabKeyWithUserId = yield select(getKeyWithUserId(SIDEKICK_TAB_KEY));
  const sidekickOpenStorageWithUserId = yield select(getKeyWithUserId(SIDEKICK_OPEN_STORAGE));

  if (sidekickTabKeyWithUserId && sidekickOpenStorageWithUserId) {
    const isSidekickOpen = resolveFromLocalStorageAsBoolean(sidekickOpenStorageWithUserId);
    const activeSidekickTab = resolveActiveTab(sidekickTabKeyWithUserId);

    yield put(
      update({
        isSidekickOpen,
        activeSidekickTab,
      })
    );
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.updateSidekick, updateSidekick);
  yield takeLatest(SagaActionTypes.setActiveSidekickTab, updateActiveSidekickTab);
  yield takeLatest(SagaActionTypes.syncSidekickState, syncSidekickState);
}
