import { expectSaga } from 'redux-saga-test-plan';
import {
  clearUsers,
  fetchCurrentUserProfileImage,
  receiveSearchResults,
  updateUserProfileImageFromCache,
} from './saga';
import { call, spawn } from 'redux-saga/effects';
import { rootReducer } from '../reducer';
import { denormalize } from '.';
import { StoreBuilder } from '../test/store';
import { downloadFile, uploadFile, editProfile as matrixEditProfile } from '../../lib/chat';
import { editUserProfile as apiEditUserProfile } from '../edit-profile/api';

const mockIdb = {
  state: {},
  put(key, item) {
    this.state[key] = item;
  },
  get(key) {
    return this.state[key];
  },
};

jest.mock('../../lib/storage/idb', () => ({
  getProvider: () => mockIdb,
}));

describe(clearUsers, () => {
  it('removes the users', async () => {
    const users = { 'id-one': { id: 'id-one', name: 'this should be removed' } };
    const notifications = { 'id-two': { id: 'id-two', name: 'do not remove this one' } };

    const {
      storeState: { normalized },
    } = await expectSaga(clearUsers)
      .withReducer(rootReducer)
      .withState({
        normalized: { users, notifications },
      })
      .run();

    expect(normalized).toEqual({
      users: {},
      notifications,
    });
  });
});

describe(receiveSearchResults, () => {
  it('translates the search results into user records', async () => {
    const user1 = {
      id: 'user-1',
      name: 'Test User 1',
      profileImage: 'image-url-1',
      primaryZID: 'zid-1',
      primaryWalletAddress: '0x9876543231',
    };
    const user2 = {
      id: 'user-2',
      name: 'Test User 2',
      profileImage: 'image-url-2',
      primaryZID: null,
      primaryWalletAddress: '0x123456789',
    };
    const user3 = {
      id: 'user-3',
      name: 'Test User 3',
      profileImage: 'image-url-3',
      primaryZID: null,
      primaryWalletAddress: null,
    };

    const { storeState } = await expectSaga(receiveSearchResults, [
      user1,
      user2,
      user3,
    ])
      .withReducer(rootReducer)
      .provide([
        [call(downloadFile, 'image-url-1'), 'downloaded-image-url-1'],
        [call(downloadFile, 'image-url-2'), 'downloaded-image-url-2'],
        [call(downloadFile, 'image-url-3'), 'downloaded-image-url-3'],
      ])
      .run();

    expect(denormalize(user1.id, storeState)).toEqual(
      expect.objectContaining({
        userId: user1.id,
        firstName: user1.name,
        profileImage: 'downloaded-image-url-1',
        primaryZID: user1.primaryZID,
        displaySubHandle: 'zid-1',
      })
    );
    expect(denormalize(user2.id, storeState)).toEqual(
      expect.objectContaining({
        userId: user2.id,
        firstName: user2.name,
        profileImage: 'downloaded-image-url-2',
        primaryZID: user2.primaryZID,
        displaySubHandle: '0x1234...6789',
      })
    );
    expect(denormalize(user3.id, storeState)).toEqual(
      expect.objectContaining({
        userId: user3.id,
        firstName: user3.name,
        profileImage: 'downloaded-image-url-3',
        primaryZID: user3.primaryZID,
        displaySubHandle: '',
      })
    );
  });

  it('does not replace an existing record', async () => {
    const user1 = { id: 'user-1', name: 'Test User 1', profileImage: 'image-url-1' };

    const existingUser = { userId: 'user-1', firstName: 'Test', lastName: 'User 1', profileImage: 'image-url-2' };
    const initialState = new StoreBuilder().withUsers(existingUser);

    const { storeState } = await expectSaga(receiveSearchResults, [user1])
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(denormalize(user1.id, storeState)).toEqual(expect.objectContaining(existingUser));
  });
});

describe(fetchCurrentUserProfileImage, () => {
  it('calls updateUserProfileImageFromCache if the current user is logging in for the first time', async () => {
    const currentUser: any = {
      id: 'user-id-1',
      matrixId: 'matrix-id-1',
      profileId: 'profile-id-1',
      profileSummary: { firstName: 'Alice' },
      primaryZID: 'zid-1',
    };
    const initialState = new StoreBuilder().withCurrentUser(currentUser).withRegistration({ isFirstTimeLogin: true });

    await expectSaga(fetchCurrentUserProfileImage)
      .provide([
        [call(updateUserProfileImageFromCache, expect.anything()), ''],
        [
          spawn(matrixEditProfile, { displayName: 'Alice' }),
          undefined,
        ],
      ])
      .withReducer(rootReducer, initialState.build())
      .call(updateUserProfileImageFromCache, currentUser)
      .run();
  });

  it('returns if no profile image is found', async () => {
    const currentUser: any = {
      id: 'user-id-1',
      profileSummary: { firstName: 'Alice', profileImage: '' },
    };
    const initialState = new StoreBuilder().withCurrentUser(currentUser).withRegistration({ isFirstTimeLogin: false });

    const { storeState } = await expectSaga(fetchCurrentUserProfileImage)
      .provide([[call(updateUserProfileImageFromCache, expect.anything()), undefined]])
      .withReducer(rootReducer, initialState.build())
      .not.call(updateUserProfileImageFromCache, currentUser)
      .not.call(downloadFile, '')
      .run();

    expect(storeState.authentication.user.data.profileSummary.profileImage).toBe('');
  });

  it('downloads the profile image and updates the store', async () => {
    const currentUser: any = {
      id: 'user-id-1',
      profileSummary: { firstName: 'Alice', profileImage: 'image-url' },
    };
    const initialState = new StoreBuilder().withCurrentUser(currentUser).withRegistration({ isFirstTimeLogin: false });

    const { storeState } = await expectSaga(fetchCurrentUserProfileImage)
      .provide([[call(downloadFile, 'image-url'), 'downloaded-image-url']])
      .withReducer(rootReducer, initialState.build())
      .call(downloadFile, 'image-url')
      .run();

    expect(storeState.authentication.user.data.profileSummary.profileImage).toBe('downloaded-image-url');
  });
});

describe(updateUserProfileImageFromCache, () => {
  it('updates only displayname & returns undefined if no profile image is found', async () => {
    const currentUser: any = {
      id: 'user-id-1',
      profileSummary: { firstName: 'Alice' },
      primaryZID: '0://zid',
    };

    mockIdb.put('profileImage', undefined);

    const { returnValue } = await expectSaga(updateUserProfileImageFromCache, currentUser)
      .provide([
        [
          spawn(matrixEditProfile, { displayName: 'Alice' }),
          undefined,
        ],
      ])
      .spawn(matrixEditProfile, { displayName: 'Alice' })
      .run();

    expect(returnValue).toBeUndefined();
  });

  it('returns if edit profile fails', async () => {
    const currentUser: any = {
      id: 'user-id-1',
      profileSummary: { firstName: 'Alice' },
      primaryZID: '0://zid',
    };

    const file: any = { name: 'Some file', type: 'image/png' };
    mockIdb.put('profileImage', file);

    console.error = jest.fn();
    const { returnValue } = await expectSaga(updateUserProfileImageFromCache, currentUser)
      .provide([
        [call(uploadFile, file), 'uploaded-image-url'],
        [
          call(apiEditUserProfile, { name: 'Alice', primaryZID: '0://zid', profileImage: 'uploaded-image-url' }),
          { success: false },
        ],
      ])
      .not.spawn(matrixEditProfile, { avatarUrl: 'uploaded-image-url', displayName: 'Alice' })
      .run();

    expect(returnValue).toBeUndefined();
  });

  it('uploads the profile Image, edits the user profile, and sets the state to success', async () => {
    const currentUser: any = {
      id: 'user-id-1',
      profileSummary: { firstName: 'Alice' },
      primaryZID: '0://zid',
    };

    const file: any = { name: 'Some file', type: 'image/png' };
    mockIdb.put('profileImage', file);

    const { returnValue } = await expectSaga(updateUserProfileImageFromCache, currentUser)
      .provide([
        [call(uploadFile, file), 'uploaded-image-url'],
        [
          call(apiEditUserProfile, { name: 'Alice', primaryZID: '0://zid', profileImage: 'uploaded-image-url' }),
          { success: true },
        ],
        [
          spawn(matrixEditProfile, { avatarUrl: 'uploaded-image-url', displayName: 'Alice' }),
          undefined,
        ],
      ])
      .spawn(matrixEditProfile, { avatarUrl: 'uploaded-image-url', displayName: 'Alice' })
      .run();

    expect(returnValue).toBe('uploaded-image-url');
  });
});
