import { SIDEKICK_OPEN_STORAGE } from './constants';
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

export function* saga() {
  yield takeLatest(SagaActionTypes.updateSidekick, updateSidekick);
}
