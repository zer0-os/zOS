import { call, put, take } from 'redux-saga/effects';
import { InviteCodeStatus, RegistrationStage, SagaActionTypes, setInviteStatus, setLoading, setStage } from '.';
import {
  validateInvite as apiValidateInvite,
  createAccount as apiCreateAccount,
  updateProfile as apiUpdateProfile,
} from './api';

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

export function* createAccount(action) {
  const { email, password } = action.payload;
  yield put(setLoading(true));
  try {
    const success = yield call(apiCreateAccount, { email, password });
    if (success) {
      yield put(setStage(RegistrationStage.ProfileDetails));
      return true;
    }
  } finally {
    yield put(setLoading(false));
  }
  return false;
}

export function* updateProfile(action) {
  const { name } = action.payload;
  yield put(setLoading(true));
  try {
    const success = yield call(apiUpdateProfile, { name });
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

  do {
    const action = yield take(SagaActionTypes.CreateAccount);
    success = yield call(createAccount, action);
  } while (!success);

  do {
    const action = yield take(SagaActionTypes.UpdateProfile);
    success = yield call(updateProfile, action);
  } while (!success);
}
