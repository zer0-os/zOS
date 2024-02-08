import { expectSaga } from 'redux-saga-test-plan';
import { clearUsers, receiveSearchResults } from './saga';

import { rootReducer } from '../reducer';
import { denormalize } from '.';
import { StoreBuilder } from '../test/store';

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
      wallets: ['0x9876543231'],
    };
    const user2 = {
      id: 'user-2',
      name: 'Test User 2',
      profileImage: 'image-url-2',
      primaryZID: null,
      wallets: ['0x123456789'],
    };
    const user3 = {
      id: 'user-3',
      name: 'Test User 3',
      profileImage: 'image-url-3',
      primaryZID: null,
      wallets: null,
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
        profileImage: user1.profileImage,
        primaryZID: user1.primaryZID,
        displaySubHandle: 'zid-1',
      })
    );
    expect(denormalize(user2.id, storeState)).toEqual(
      expect.objectContaining({
        userId: user2.id,
        firstName: user2.name,
        profileImage: user2.profileImage,
        primaryZID: user2.primaryZID,
        displaySubHandle: '0x1234...6789',
      })
    );
    expect(denormalize(user3.id, storeState)).toEqual(
      expect.objectContaining({
        userId: user3.id,
        firstName: user3.name,
        profileImage: user3.profileImage,
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
