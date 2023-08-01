import { call, put, select, takeLatest } from 'redux-saga/effects';
import { SagaActionTypes, State, setErrors, setState } from '.';
import { editUserProfile as apiEditUserProfile } from './api';
import { ProfileDetailsErrors } from '../registration';
import { uploadImage } from '../registration/api';
import cloneDeep from 'lodash/cloneDeep';
import { currentUserSelector } from '../authentication/saga';
import { setUser } from '../authentication';

export function* editProfile(action) {
  const { name, image } = action.payload;

  yield put(setState(State.INPROGRESS));
  try {
    let profileImage = '';
    if (image) {
      try {
        const uploadResult = yield call(uploadImage, image);
        profileImage = uploadResult.url;
      } catch (error) {
        yield put(setErrors([ProfileDetailsErrors.FILE_UPLOAD_ERROR]));
        return;
      }
    }

    const { profileId } = yield select((state) => state.authentication.user.data);
    const response = yield call(apiEditUserProfile, {
      profileId,
      name,
      profileImage: profileImage === '' ? undefined : profileImage,
    });
    if (response.success) {
      yield call(updateUserProfile, { name, profileImage });
      yield put(setState(State.SUCCESS));
      return;
    }
  } catch (e) {
    yield put(setErrors([ProfileDetailsErrors.UNKNOWN_ERROR]));
  }

  yield put(setState(State.LOADED));
  return;
}

export function* updateUserProfile(payload) {
  let currentUser = cloneDeep(yield select(currentUserSelector()));
  currentUser.profileSummary = {
    ...currentUser.profileSummary,
    firstName: payload.name,
    profileImage: payload.profileImage || currentUser.profileSummary.profileImage,
  };
  yield put(setUser({ data: currentUser }));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.EditProfile, editProfile);
}
