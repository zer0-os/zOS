import { call, put, take } from 'redux-saga/effects';
import { RegistrationStage, SagaActionTypes, setLoading, setStage } from '.';
import { validateInvite as apiValidateInvite } from './api';

export function* validateInvite(action) {
  const { code } = action.payload;
  yield put(setLoading(true));
  try {
    const success = yield call(apiValidateInvite, { code });
    if (success) {
      yield put(setStage(RegistrationStage.Done));
      return true;
    }
  } finally {
    yield put(setLoading(false));
  }
}

export function* saga() {
  let success;
  do {
    const action = yield take(SagaActionTypes.ValidateInvite);
    success = yield call(validateInvite, action);
  } while (!success);
}
