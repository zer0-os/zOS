import { call, delay, put, race, select, spawn, take } from 'redux-saga/effects';
import {
  AccountCreationErrors,
  InviteCodeStatus,
  ProfileDetailsErrors,
  RegistrationStage,
  SagaActionTypes,
  setInviteStatus,
  setErrors,
  setLoading,
  setStage,
  setInviteCode,
  setUserId,
  setFirstTimeLogin,
  setInviteToastOpen,
} from '.';
import {
  validateInvite as apiValidateInvite,
  createAccount as apiCreateAccount,
  createWeb3Account as apiCreateWeb3Account,
  completeAccount as apiCompleteAccount,
  uploadImage,
} from './api';
import { fetchCurrentUser } from '../authentication/api';
import { nonce as nonceApi } from '../authentication/api';
import { passwordStrength } from '../../lib/password';
import { conversationsChannel } from '../channels-list/channels';
import { rawConversationsList } from '../channels-list/saga';
import { setActiveMessengerId } from '../chat';
import { featureFlags } from '../../lib/feature-flags';

export function* validateInvite(action) {
  const { code } = action.payload;
  yield put(setLoading(true));
  try {
    const inviteCodeStatus = yield call(apiValidateInvite, { code });
    yield put(setInviteStatus(inviteCodeStatus));

    if (inviteCodeStatus === InviteCodeStatus.VALID) {
      if (!featureFlags.allowWeb3Registration) {
        yield put(setStage(RegistrationStage.EmailAccountCreation));
      } else {
        yield put(setStage(RegistrationStage.SelectMethod));
      }
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
    const validationErrors = yield call(validateAccountInfo, { email, password });
    if (validationErrors.length) {
      yield put(setErrors(validationErrors));
      return false;
    }

    const { nonceToken } = yield call(nonceApi);
    // Handle is a required field. To try to ensure uniqueness, we'll use the email address.
    const result = yield call(apiCreateAccount, {
      email: email.trim(),
      password,
      handle: email,
      inviteCode,
      nonceToken,
    });
    if (result.success) {
      const userFetch = yield call(fetchCurrentUser);
      if (userFetch) {
        yield put(setUserId(userFetch.id));
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

export function* createWeb3Account(action) {
  const { token } = action.payload;
  yield put(setLoading(true));
  try {
    const inviteCode = yield select((state) => state.registration.inviteCode);
    const result = yield call(apiCreateWeb3Account, {
      inviteCode,
      web3Token: token,
    });
    if (result.success) {
      const userFetch = yield call(fetchCurrentUser);
      if (userFetch) {
        yield put(setUserId(userFetch.id));
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

export function validateAccountInfo({ email, password }) {
  const validationErrors = [];

  if (!email.trim()) {
    validationErrors.push(AccountCreationErrors.EMAIL_REQUIRED);
  }

  if (!password.trim()) {
    validationErrors.push(AccountCreationErrors.PASSWORD_REQUIRED);
  } else if (passwordStrength(password) < 2) {
    validationErrors.push(AccountCreationErrors.PASSWORD_TOO_WEAK);
  }

  return validationErrors;
}

export function* updateProfile(action) {
  const { name, image } = action.payload;
  yield put(setLoading(true));
  try {
    if (!name.trim()) {
      yield put(setErrors([ProfileDetailsErrors.NAME_REQUIRED]));
      return false;
    }

    let profileImage = '';
    if (image) {
      try {
        const uploadResult = yield call(uploadImage, image);
        profileImage = uploadResult.url;
      } catch (error) {
        yield put(setErrors([ProfileDetailsErrors.FILE_UPLOAD_ERROR]));
        return false;
      }
    }

    const { userId, inviteCode } = yield select((state) => state.registration);
    const response = yield call(apiCompleteAccount, { userId, name, inviteCode, profileImage });
    if (response.success) {
      yield put(setFirstTimeLogin(true));
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

function* validateInvitePage() {
  let success;
  do {
    const action = yield take(SagaActionTypes.ValidateInvite);
    success = yield call(validateInvite, action);
  } while (!success);
}

function* createAccountPage() {
  let success;
  do {
    const { email, web3 } = yield race({
      email: take(SagaActionTypes.CreateAccount),
      web3: take(SagaActionTypes.CreateWeb3Account),
    });
    success = false;
    if (email) {
      success = yield call(createAccount, email);
    } else if (web3) {
      success = yield call(createWeb3Account, web3);
    }
  } while (!success);
}

function* updateProfilePage() {
  let success;
  do {
    const action = yield take(SagaActionTypes.UpdateProfile);
    success = yield call(updateProfile, action);
  } while (!success);
}

export function* saga() {
  yield validateInvitePage();
  yield createAccountPage();
  yield updateProfilePage();

  // After successful registration
  yield spawn(openFirstConversation);
  yield spawn(openInviteToastWhenRewardsPopupClosed);
}

export function* channelsLoaded() {
  const existingConversationsList = yield select(rawConversationsList());
  if (existingConversationsList.length > 0) {
    yield put(setActiveMessengerId(existingConversationsList[0]));
  }
}

function* openFirstConversation() {
  const channel = yield call(conversationsChannel);
  const payload = yield take(channel, '*');
  if (payload.loaded) {
    yield call(channelsLoaded);
  }
}

function* openInviteToastWhenRewardsPopupClosed() {
  yield take(SagaActionTypes.RewardsPopupClosed);
  yield delay(10000);
  yield put(setInviteToastOpen(true));
}
