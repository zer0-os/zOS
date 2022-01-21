import { takeLatest, put } from 'redux-saga/effects';
import { SagaActionTypes, receiveRoute } from '.';

export function* setRoute(action) {
  yield put(receiveRoute(action.payload));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.SetRoute, setRoute);
}
