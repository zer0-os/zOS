import { takeLatest, put } from 'redux-saga/effects';
import { SagaActionTypes, receive } from '.';

export function* setSelectedApp(action) {
  const selectedApp = action.payload as string;

  yield put(receive(selectedApp));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateRoute, setSelectedApp);
}
