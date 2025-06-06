import { call, put, race, select, spawn, take } from 'redux-saga/effects';
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
} from '.';
import {
  validateInvite as apiValidateInvite,
  createAccount as apiCreateAccount,
  createWeb3Account as apiCreateWeb3Account,
  completeAccount as apiCompleteAccount,
  addEmailAccount as apiAddEmailAccount,
} from './api';
import { fetchCurrentUser, nonce as nonceApi } from '../authentication/api';
import { isPasswordValid } from '../../lib/password';
import { getSignedToken } from '../web3/saga';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { completeUserLogin } from '../authentication/saga';
import { getHistory } from '../../lib/browser';
import { setIsComplete as setPageLoadComplete } from '../page-load';
import { createConversation } from '../channels-list/saga';
import { getProvider as getIndexedDbProvider } from '../../lib/storage/media-cache/idb';
import { getUserByMatrixId } from '../users/saga';
import { User } from '../channels';

export function* validateInvite(action) {
  const { code } = action.payload;
  yield put(setLoading(true));
  try {
    const inviteCodeStatus = yield call(apiValidateInvite, { code });
    yield put(setInviteStatus(inviteCodeStatus));

    if (inviteCodeStatus === InviteCodeStatus.VALID) {
      yield put(setStage(RegistrationStage.WalletAccountCreation));
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

export function* authorizeAndCreateWeb3Account() {
  yield put(setLoading(true));
  try {
    let result = yield call(getSignedToken);
    if (!result.success) {
      yield put(setErrors([result.error]));
      return false;
    }
    const inviteCode = yield select((state) => state.registration.inviteCode);
    result = yield call(apiCreateWeb3Account, { inviteCode, web3Token: result.token });
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
  } else if (!isPasswordValid(password)) {
    validationErrors.push(AccountCreationErrors.PASSWORD_TOO_WEAK);
  }

  return validationErrors;
}

export function* cacheProfileImage(image) {
  const provider = yield call(getIndexedDbProvider);
  yield call([provider, provider.put], 'profileImage', image);
}

export function* updateProfile(action) {
  const { name, image } = action.payload;
  yield put(setLoading(true));
  try {
    if (!name.trim()) {
      yield put(setErrors([ProfileDetailsErrors.NAME_REQUIRED]));
      return false;
    }

    // we cache the image for now, as we need to upload it to the homeserver later
    // (when the matrix client is initialized)
    if (image) {
      yield call(cacheProfileImage, image);
    }

    const { userId, inviteCode } = yield select((state) => state.registration);
    const response = yield call(apiCompleteAccount, { userId, name, inviteCode, profileImage: '' });
    if (response.success) {
      yield put(setFirstTimeLogin(true));
      yield call(completeUserLogin);
      yield put(setStage(RegistrationStage.Done));

      yield call(createWelcomeConversation, response.response.inviter);

      yield spawn(clearRegistrationStateOnLogout);
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
      success = yield call(authorizeAndCreateWeb3Account);
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

export function* clearRegistrationStateOnLogout() {
  const authChannel = yield call(getAuthChannel);
  yield take(authChannel, AuthEvents.UserLogout);
  yield put(setFirstTimeLogin(false));
}

// sets initial state & takes the user to "complete profile" page
export function* completePendingUserProfile(user) {
  yield put(setPageLoadComplete(true)); // allow page to load incase of incomplete profile
  yield put(setStage(RegistrationStage.ProfileDetails));
  yield put(setUserId(user.id));

  const history = getHistory();
  history.replace({
    pathname: '/get-access',
  });

  yield updateProfilePage();
}

export function* saga() {
  yield validateInvitePage();
  yield createAccountPage();
  yield updateProfilePage();
}

export function* createWelcomeConversation(inviter: { id: string; matrixId: string }) {
  if (!inviter?.id || !inviter?.matrixId) {
    return;
  }

  try {
    const user: User = yield call(getUserByMatrixId, inviter.matrixId);
    if (user) {
      yield call(createConversation, [user.userId], '', null);
    }
  } catch (error) {}
}

export function* addEmailAccount({ email, password }: { email: string; password: string }) {
  yield put(setLoading(true));
  try {
    const validationErrors = yield call(validateAccountInfo, { email, password });
    if (validationErrors.length) {
      yield put(setErrors(validationErrors));
      return false;
    }

    const result = yield call(apiAddEmailAccount, {
      email: email.trim(),
      password,
    });

    if (result.success) {
      yield put(setErrors([]));
      return result;
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
