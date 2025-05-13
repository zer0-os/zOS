import { expectSaga } from 'redux-saga-test-plan';
import { clearUsers, verifyMatrixProfileDisplayNameIsSynced } from './saga';
import { call } from 'redux-saga/effects';
import { rootReducer } from '../reducer';
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
