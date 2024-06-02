import { takeLatest, put } from 'redux-saga/effects';
import { SagaActionTypes, setSelectedMainBackground } from '.';

export const keyStorageMainBackground = 'mainBackground:selectedMainBackground';

export function* setMainBackground(action) {
  const selectedMainBackground = action.payload;

  localStorage.setItem(keyStorageMainBackground, selectedMainBackground);

  yield put(setSelectedMainBackground(selectedMainBackground));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.SetMainBackground, setMainBackground);
}
