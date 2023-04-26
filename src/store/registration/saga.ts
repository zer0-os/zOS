import { call, put, select, take } from 'redux-saga/effects';
import {
  AccountCreationErrors,
  InviteCodeStatus,
  ProfileDetailsErrors,
  RegistrationStage,
  SagaActionTypes,
  setInviteStatus,
  setErrors,
  setLoading,
  setProfileId,
  setStage,
  setInviteCode,
} from '.';
import {
  validateInvite as apiValidateInvite,
  createAccount as apiCreateAccount,
  updateProfile as apiUpdateProfile,
} from './api';
import { fetchCurrentUser } from '../authentication/api';

export function* validateInvite(action) {
  const { code } = action.payload;
  yield put(setLoading(true));
  try {
    const inviteCodeStatus = yield call(apiValidateInvite, { code });
    yield put(setInviteStatus(inviteCodeStatus));

    if (inviteCodeStatus === InviteCodeStatus.VALID) {
      yield put(setStage(RegistrationStage.AccountCreation));
      yield put(setInviteCode(code));
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
    const inviteCode = yield select((state) => state.registration.inviteCode);
    const validationErrors = [];
    if (!email.trim()) {
      validationErrors.push(AccountCreationErrors.EMAIL_REQUIRED);
    }
    if (!password.trim()) {
      validationErrors.push(AccountCreationErrors.PASSWORD_REQUIRED);
    }

    if (validationErrors.length) {
      yield put(setErrors(validationErrors));
      return false;
    }

    // Handle is a required field. To try to ensure uniqueness, we'll use the email address.
    const result = yield call(apiCreateAccount, { email: email.trim(), password, handle: email, inviteCode });
    if (result.success) {
      const userFetch = yield call(fetchCurrentUser);
      if (userFetch) {
        yield put(setProfileId(userFetch.profileSummary.id));
        yield put(setStage(RegistrationStage.ProfileDetails));
        yield put(setErrors([]));
        return true;
      } else {
        yield put(setErrors([AccountCreationErrors.UNKNOWN_ERROR]));
      }
    } else {
      yield put(setErrors([result.response]));
    }
  } catch (e) {
    yield put(setErrors([AccountCreationErrors.UNKNOWN_ERROR]));
  } finally {
    yield put(setLoading(false));
  }
  return false;
}

export function* updateProfile(action) {
  const { name } = action.payload;
  yield put(setLoading(true));
  try {
    if (!name.trim()) {
      yield put(setErrors([ProfileDetailsErrors.NAME_REQUIRED]));
      return false;
    }

    const profileId = yield select((state) => state.registration.profileId);
    const success = yield call(apiUpdateProfile, { id: profileId, firstName: name });
    if (success) {
      yield put(setStage(RegistrationStage.Done));
      return true;
    } else {
      yield put(setErrors([ProfileDetailsErrors.UNKNOWN_ERROR]));
    }
  } catch (e) {
    yield put(setErrors([ProfileDetailsErrors.UNKNOWN_ERROR]));
  } finally {
    yield put(setLoading(false));
  }
  return false;
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
