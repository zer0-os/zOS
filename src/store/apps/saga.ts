import { takeLatest, put } from 'redux-saga/effects';
import { SagaActionTypes, receive } from '.';
import { apps } from '../../lib/apps';

export function* setSelectedApp(action) {
  const selectedApp = action.payload;

  yield put(receive(apps[selectedApp]));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateApp, setSelectedApp);
}
