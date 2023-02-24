import { SIDEKICK_OPEN_STORAGE, SIDEKICK_TAB_KEY } from './constants';
import { put, takeLatest } from 'redux-saga/effects';
import { update, SagaActionTypes } from './';

export function* updateSidekick(action) {
  const { isOpen } = action.payload;

  localStorage.setItem(SIDEKICK_OPEN_STORAGE, isOpen);

  yield put(
    update({
      isSidekickOpen: isOpen,
    })
  );
}

export function* updateActiveSidekickTab(action) {
  const { activeTab } = action.payload;

  localStorage.setItem(SIDEKICK_TAB_KEY, activeTab);

  yield put(
    update({
      activeSidekickTabOpen: activeTab,
    })
  );
}

export function* saga() {
  yield takeLatest(SagaActionTypes.updateSidekick, updateSidekick);
  yield takeLatest(SagaActionTypes.setActiveSidekickTab, updateActiveSidekickTab);
}
