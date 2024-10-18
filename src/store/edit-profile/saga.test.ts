import { expectSaga } from 'redux-saga-test-plan';
import { call, spawn } from 'redux-saga/effects';
import { editProfile as editProfileSaga, updateUserProfile, fetchOwnedZIDs, getLocalUrl } from './saga';
import { editUserProfile as apiEditUserProfile, fetchOwnedZIDs as apiFetchOwnedZIDs } from './api';
import { uploadFile, editProfile as matrixEditProfile } from '../../lib/chat';

import { EditProfileState, State, initialState as initialEditProfileState, setLoadingZIDs } from '.';
import { rootReducer } from '../reducer';
import { User } from '../authentication/types';
import { ProfileDetailsErrors } from '../registration';
import { throwError } from 'redux-saga-test-plan/providers';
import { setOwnedZIDs } from './index';

describe('editProfile', () => {
  const name = 'John Doe';
  const image: any = { some: 'new-file' };
  const primaryZID = 'primary-zid';

  it('edits the profile successfully', async () => {
    const profileImage = 'profile-image-url';
    const primaryZID = 'primary-zid';

    const {
      storeState: { editProfile, authentication },
    } = await expectSaga(editProfileSaga, { payload: { name, image, primaryZID } })
      .provide([
        [
          call(uploadFile, image),
          profileImage,
        ],
        [
          call(apiEditUserProfile, { name, profileImage, primaryZID }),
          { success: true },
        ],
        [spawn(matrixEditProfile, { avatarUrl: profileImage, displayName: name }), {}],
        [call(getLocalUrl, image), 'local-image-url'],
      ])
      .call(updateUserProfile, { name, profileImage: 'local-image-url', primaryZID })
      .withReducer(
        rootReducer,
        initialState(
          {},
          { profileSummary: { firstName: 'old-name', profileImage: 'old-image' } as any, primaryZID: 'old-zid' }
        )
      )
      .spawn(matrixEditProfile, { avatarUrl: profileImage, displayName: name })
      .run();

    expect(authentication.user.data.profileSummary.firstName).toEqual('John Doe');
    expect(authentication.user.data.profileSummary.profileImage).toEqual('local-image-url');
    expect(authentication.user.data.primaryZID).toEqual('primary-zid');
    expect(editProfile.state).toEqual(State.SUCCESS);
    expect(editProfile.errors).toEqual([]);
  });

  it('sets an error if image upload fails', async () => {
    const {
      storeState: { editProfile },
    } = await expectSaga(editProfileSaga, { payload: { name, image } })
      .provide([
        [
          call(uploadFile, image),
          throwError(new Error('Image upload failed')),
        ],
      ])
      .withReducer(rootReducer, initialState())
      .run();

    expect(editProfile.state).toEqual(State.INPROGRESS);
    expect(editProfile.errors).toEqual([ProfileDetailsErrors.FILE_UPLOAD_ERROR]);
  });

  it('sets an error if API response is not successful', async () => {
    const {
      storeState: { editProfile },
    } = await expectSaga(editProfileSaga, { payload: { name, image, primaryZID } })
      .provide([
        [
          call(uploadFile, image),
          'profile-image-url',
        ],
        [
          call(apiEditUserProfile, { name, primaryZID, profileImage: 'profile-image-url' }),
          throwError(new Error('API call failed')),
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .run();

    expect(editProfile.state).toEqual(State.LOADED);
    expect(editProfile.errors).toEqual([ProfileDetailsErrors.UNKNOWN_ERROR]);
  });

  it('updates profile without an image', async () => {
    const {
      storeState: { editProfile, authentication },
    } = await expectSaga(editProfileSaga, { payload: { name, primaryZID } })
      .provide([
        [
          call(apiEditUserProfile, { name, primaryZID, profileImage: undefined }),
          { success: true },
        ],
        [spawn(matrixEditProfile, { avatarUrl: '', displayName: name }), {}],
      ])
      .withReducer(
        rootReducer,
        initialState({}, { profileSummary: { firstName: 'old-name', profileImage: 'old-image' } as any })
      )
      .run();

    expect(authentication.user.data.profileSummary.firstName).toEqual('John Doe'); // name is new
    expect(authentication.user.data.profileSummary.profileImage).toEqual('old-image'); // but image is old
    expect(editProfile.state).toEqual(State.SUCCESS);
    expect(editProfile.errors).toEqual([]);
  });
});

describe('updateUserProfile', () => {
  const currentUser = {
    profileSummary: {
      firstName: 'old-name',
      profileImage: 'old-image',
    },
  };

  it('updates the user profile in the store', async () => {
    const updatedName = 'Updated Name';
    const updatedProfileImage = 'new-profile-image-url';

    const {
      storeState: { authentication },
    } = await expectSaga(updateUserProfile, { name: updatedName, profileImage: updatedProfileImage })
      .withReducer(rootReducer, initialState({}, currentUser as any))
      .run();

    const updatedUser = {
      profileSummary: {
        firstName: 'Updated Name',
        profileImage: 'new-profile-image-url',
      },
    };

    expect(authentication.user.data).toEqual(updatedUser);
  });
});

describe('fetchOwnedZIDs', () => {
  it('fetches owned ZIDs', async () => {
    const ownedZIDs = ['0://zid:1', '0://zid:2'];

    const {
      storeState: { editProfile },
    } = await expectSaga(fetchOwnedZIDs)
      .provide([
        [call(apiFetchOwnedZIDs), ownedZIDs],
      ])
      .withReducer(rootReducer, initialState())
      .put(setLoadingZIDs(true))
      .put(setOwnedZIDs(ownedZIDs))
      .run();

    expect(editProfile.ownedZIDs).toEqual(ownedZIDs);
    expect(editProfile.loadingZIDs).toEqual(false);
  });
});

function initialState(editProfileAttrs: Partial<EditProfileState> = {}, data: Partial<User> = {}) {
  return {
    authentication: {
      user: {
        data: {
          ...data,
        },
      },
    },
    editProfile: {
      ...initialEditProfileState,
      ...editProfileAttrs,
    },
  } as any;
}
