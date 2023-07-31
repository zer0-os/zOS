import { call, put, select, takeLatest } from 'redux-saga/effects';
import { SagaActionTypes, State, setErrors, setState } from '.';
import { editUserProfile as apiEditUserProfile } from './api';
import { ProfileDetailsErrors } from '../registration';
import { uploadImage } from '../registration/api';
import { Events, getAuthChannel } from '../authentication/channels';

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
      yield call(publishUserProfileEdited, { name, profileImage });
      yield put(setState(State.SUCCESS));
      return;
    }
  } catch (e) {
    yield put(setErrors([ProfileDetailsErrors.UNKNOWN_ERROR]));
  }

  yield put(setState(State.LOADED));
  return;
}

export function* publishUserProfileEdited(payload) {
  const channel = yield call(getAuthChannel);
  yield put(channel, { type: Events.UserProfileUpdated, payload });
}

export function* saga() {
  yield takeLatest(SagaActionTypes.EditProfile, editProfile);
}
