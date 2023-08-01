import { expectSaga } from 'redux-saga-test-plan';
import { call, select } from 'redux-saga/effects';
import { editProfile as editProfileSaga, updateUserProfile } from './saga';
import { editUserProfile as apiEditUserProfile } from './api';
import { currentUserSelector } from '../authentication/saga';
import { uploadImage } from '../registration/api';
import { EditProfileState, State, initialState as initialEditProfileState } from '.';
import { rootReducer } from '../reducer';
import { User } from '../authentication/types';
import { ProfileDetailsErrors } from '../registration';
import { throwError } from 'redux-saga-test-plan/providers';

describe('editProfile', () => {
  const name = 'John Doe';
  const image: any = { some: 'new-file' };

  it('edits the profile successfully', async () => {
    const profileId = 'profile-id';
    const profileImage = 'profile-image-url';

    const {
      storeState: { editProfile, authentication },
    } = await expectSaga(editProfileSaga, { payload: { name, image } })
      .provide([
        [
          select(currentUserSelector),
          { profileId },
        ],
        [
          call(uploadImage, image),
          { url: profileImage },
        ],
        [
          call(apiEditUserProfile, { profileId, name, profileImage }),
          { success: true },
        ],
      ])
      .call(updateUserProfile, { name, profileImage })
      .withReducer(
        rootReducer,
        initialState({}, { profileId, profileSummary: { firstName: 'old-name', profileImage: 'old-image' } as any })
      )
      .run();

    expect(authentication.user.data.profileSummary.firstName).toEqual('John Doe');
    expect(authentication.user.data.profileSummary.profileImage).toEqual('profile-image-url');
    expect(editProfile.state).toEqual(State.SUCCESS);
    expect(editProfile.errors).toEqual([]);
  });

  it('sets an error if image upload fails', async () => {
    const {
      storeState: { editProfile },
    } = await expectSaga(editProfileSaga, { payload: { name, image } })
      .provide([
        [
          call(uploadImage, image),
          throwError(new Error('Image upload failed')),
        ],
      ])
      .withReducer(rootReducer, initialState())
      .run();

    expect(editProfile.state).toEqual(State.INPROGRESS);
    expect(editProfile.errors).toEqual([ProfileDetailsErrors.FILE_UPLOAD_ERROR]);
  });

  it('sets an error if API response is not successful', async () => {
    const profileId = 'profile-id';

    const {
      storeState: { editProfile },
    } = await expectSaga(editProfileSaga, { payload: { name, image } })
      .provide([
        [
          select(currentUserSelector),
          { profileId },
        ],
        [
          call(uploadImage, image),
          { url: 'profile-image-url' },
        ],
        [
          call(apiEditUserProfile, { profileId, name, profileImage: 'profile-image-url' }),
          throwError(new Error('API call failed')),
        ],
      ])
      .withReducer(rootReducer, initialState({}, { profileId }))
      .run();

    expect(editProfile.state).toEqual(State.LOADED);
    expect(editProfile.errors).toEqual([ProfileDetailsErrors.UNKNOWN_ERROR]);
  });

  it('updates profile without an image', async () => {
    const profileId = 'profile-id';

    const {
      storeState: { editProfile, authentication },
    } = await expectSaga(editProfileSaga, { payload: { name } })
      .provide([
        [
          select(currentUserSelector),
          { profileId },
        ],
        [
          call(apiEditUserProfile, { profileId, name, profileImage: undefined }),
          { success: true },
        ],
      ])
      .withReducer(
        rootReducer,
        initialState({}, { profileId, profileSummary: { firstName: 'old-name', profileImage: 'old-image' } as any })
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
      .provide([
        [
          select(currentUserSelector),
          currentUser,
        ],
      ])
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
