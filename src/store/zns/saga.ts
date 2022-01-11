import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, receiveRoute } from '.';
import { setRoute as appSandboxSetRoute } from '../../app-sandbox/store/zns';
import { dispatch } from '../../app-sandbox/store';

export function* setRoute(action) {
  yield put(receiveRoute(action.payload));

  // do we want to encapsulate this better, or does it make
  // sense for this to need to dispatch?
  yield call(dispatch, appSandboxSetRoute(action.payload));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.SetRoute, setRoute);
}
