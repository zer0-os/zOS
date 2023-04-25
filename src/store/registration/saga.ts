import { call, put, take } from 'redux-saga/effects';
import { InviteCodeStatus, RegistrationStage, SagaActionTypes, setInviteStatus, setLoading, setStage } from '.';
import { validateInvite as apiValidateInvite } from './api';

export function* validateInvite(action) {
  const { code } = action.payload;
  yield put(setLoading(true));
  try {
    const inviteCodeStatus = yield call(apiValidateInvite, { code });
    yield put(setInviteStatus(inviteCodeStatus));

    if (inviteCodeStatus === InviteCodeStatus.VALID) {
      yield put(setStage(RegistrationStage.Done)); // probably replace this with next valid state
      return true;
    }

    return false;
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
