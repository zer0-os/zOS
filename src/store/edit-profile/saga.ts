import { call, put, select, spawn, takeLatest } from 'redux-saga/effects';
import { SagaActionTypes, State, setErrors, setLoadingZIDs, setOwnedZIDs, setState } from '.';
import {
  editUserProfile as apiEditUserProfile,
  saveUserMatrixCredentials as apiSaveUserMatrixCredentials,
  fetchOwnedZIDs as fetchOwnedZIDsApi,
} from './api';
import { ProfileDetailsErrors } from '../registration';
import cloneDeep from 'lodash/cloneDeep';
import { currentUserSelector } from '../authentication/saga';
import { setUser } from '../authentication';
import { uploadFile, editProfile as matrixEditProfile } from '../../lib/chat';

export function* getLocalUrl(file) {
  if (!file) {
    return '';
  }

  return yield call(URL.createObjectURL, file);
}

export function* editProfile(action) {
  const { name, image, primaryZID } = action.payload;

  yield put(setState(State.INPROGRESS));
  try {
    let profileImage = '';
    if (image) {
      try {
        const uploadRes = yield call(uploadFile, image);
        profileImage = uploadRes;
      } catch (error) {
        yield put(setErrors([ProfileDetailsErrors.FILE_UPLOAD_ERROR]));
        return;
      }
    }

    const response = yield call(apiEditUserProfile, {
      name,
      primaryZID,
      profileImage: profileImage === '' ? undefined : profileImage,
    });
    if (response.success) {
      yield spawn(matrixEditProfile, { avatarUrl: profileImage, displayName: name });

      const localUrl = yield call(getLocalUrl, image);
      yield call(updateUserProfile, { name, profileImage: localUrl, primaryZID });
      yield put(setState(State.SUCCESS));
      return;
    }
  } catch (e) {
    yield put(setErrors([ProfileDetailsErrors.UNKNOWN_ERROR]));
  }

  yield put(setState(State.LOADED));
  return;
}

export function* saveUserMatrixCredentials(matrixId, matrixAccessToken) {
  const response = yield call(apiSaveUserMatrixCredentials, {
    matrixId,
    matrixAccessToken,
  });

  if (response.success) {
    let currentUser = cloneDeep(yield select(currentUserSelector()));
    currentUser = { ...currentUser, matrixId, matrixAccessToken };
    yield put(setUser({ data: currentUser }));
    return;
  }
}

export function* updateUserProfile(payload) {
  let currentUser = cloneDeep(yield select(currentUserSelector()));
  currentUser.profileSummary = {
    ...currentUser.profileSummary,
    firstName: payload.name,
    profileImage: payload.profileImage || currentUser.profileSummary.profileImage,
  };
  currentUser.primaryZID = payload.primaryZID;
  yield put(setUser({ data: currentUser }));
}

export function* fetchOwnedZIDs() {
  yield put(setLoadingZIDs(true));

  try {
    const ownedZIDs = yield call(fetchOwnedZIDsApi);
    yield put(setOwnedZIDs(ownedZIDs));
  } catch (error) {
    yield put(setErrors([ProfileDetailsErrors.FETCH_OWNED_ZIDs_ERROR]));
  }

  yield put(setLoadingZIDs(false));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.EditProfile, editProfile);
  yield takeLatest(SagaActionTypes.FetchOwnedZIDs, fetchOwnedZIDs);
}
