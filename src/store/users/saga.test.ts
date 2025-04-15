import { expectSaga } from 'redux-saga-test-plan';
import { clearUsers, receiveSearchResults, verifyMatrixProfileDisplayNameIsSynced } from './saga';
import { call } from 'redux-saga/effects';
import { rootReducer } from '../reducer';
import { denormalize } from '.';
import { StoreBuilder } from '../test/store';
import { verifyMatrixProfileDisplayNameIsSynced as verifyMatrixProfileDisplayNameIsSyncedAPI } from '../../lib/chat';
const mockIdb = {
  state: {},
  put(key, item) {
    this.state[key] = item;
  },
  get(key) {
    return this.state[key];
  },
};

jest.mock('../../lib/storage/media-cache/idb', () => ({
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
      .run();

    expect(denormalize(user1.id, storeState)).toEqual(
      expect.objectContaining({
        userId: user1.id,
        firstName: user1.name,
        profileImage: 'image-url-1',
        primaryZID: user1.primaryZID,
        displaySubHandle: 'zid-1',
      })
    );
    expect(denormalize(user2.id, storeState)).toEqual(
      expect.objectContaining({
        userId: user2.id,
        firstName: user2.name,
        profileImage: 'image-url-2',
        primaryZID: user2.primaryZID,
        displaySubHandle: '0x1234...6789',
      })
    );
    expect(denormalize(user3.id, storeState)).toEqual(
      expect.objectContaining({
        userId: user3.id,
        firstName: user3.name,
        profileImage: 'image-url-3',
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

describe(verifyMatrixProfileDisplayNameIsSynced, () => {
  it('should select the current user and call the sync API with extracted profile info', async () => {
    const currentUser: any = {
      id: 'user-id-sync',
      profileSummary: { firstName: 'Test Name', profileImage: 'mxc://test/avatar' },
    };
    const initialState = new StoreBuilder().withCurrentUser(currentUser);

    await expectSaga(verifyMatrixProfileDisplayNameIsSynced)
      .provide([
        [
          call(verifyMatrixProfileDisplayNameIsSyncedAPI, 'Test Name'),
          {},
        ],
      ])
      .withReducer(rootReducer, initialState.build())
      .call(verifyMatrixProfileDisplayNameIsSyncedAPI, 'Test Name')
      .run();
  });
});
