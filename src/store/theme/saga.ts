import { takeLatest, put } from 'redux-saga/effects';
import { SagaActionTypes, receive } from '.';
import { ViewModes } from '../../shared-components/theme-engine';

export const keyStorageLightMode = 'viewMode:isLight';

export function* setViewMode(action) {
  const viewMode = action.payload;

  localStorage.setItem(keyStorageLightMode, viewMode === ViewModes.Dark ? 'false' : 'true');

  yield put(receive(viewMode));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.SaveViewMode, setViewMode);
}
