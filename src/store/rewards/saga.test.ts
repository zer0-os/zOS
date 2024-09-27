import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import BN from 'bn.js';

import {
  checkNewRewardsLoaded,
  closeRewardsTooltipAfterDelay,
  fetch,
  fetchCurrentMeowPriceInUSD,
  transferMeow,
  updateUserMeowBalance,
} from './saga';
import { fetchRewards, transferMeow as transferMeowAPI } from './api';
import { RewardsState, initialState as initialRewardsState } from '.';

import { rootReducer } from '../reducer';

const mockLocalStorage = {
  state: {},
  setItem(key, item) {
    this.state[key] = item;
  },
  getItem(key) {
    return this.state[key];
  },
};

(global as any).localStorage = mockLocalStorage;

describe('fetch', () => {
  it('fetches the rewards', async () => {
    const { storeState } = await expectSaga(fetch, { payload: {} })
      .provide([
        [
          call(fetchRewards, {}),
          { success: true, response: { meow: '517', meowPreviousDay: '599' } },
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .call(fetchRewards, {})
      .run();

    expect(storeState.rewards.meow).toEqual('517');
    expect(storeState.rewards.meowPreviousDay).toEqual('599');
  });
});

describe(checkNewRewardsLoaded, () => {
  let mockLocalStorage;
  beforeEach(() => {
    mockLocalStorage = {
      state: {},
      setItem(key, item) {
        this.state[key] = item;
      },
      getItem(key) {
        return this.state[key];
      },
    };

    (global as any).localStorage = mockLocalStorage;
  });

  it('does nothing if the user is a first time login', async () => {
    mockLocalStorage.getItem = jest.fn();

    await expectSaga(checkNewRewardsLoaded)
      .withReducer(rootReducer, initialState({ meowPreviousDay: '599' }, { registration: { isFirstTimeLogin: true } }))
      .not.call(fetchCurrentMeowPriceInUSD)
      .run();

    expect(localStorage.getItem).not.toHaveBeenCalled();
  });

  it('does nothing if the meowPreviousDay is 0', async () => {
    mockLocalStorage.getItem = jest.fn();

    await expectSaga(checkNewRewardsLoaded)
      .withReducer(rootReducer, initialState({ meowPreviousDay: '0' }))
      .run();

    expect(localStorage.getItem).not.toHaveBeenCalled();
  });

  it('fetches the current meow price if it is 0', async () => {
    mockLocalStorage.getItem = jest.fn();

    await expectSaga(checkNewRewardsLoaded)
      .withReducer(rootReducer, initialState({ meowInUSD: 0 }))
      .call(fetchCurrentMeowPriceInUSD)
      .run();
  });

  it('sets the new rewards indicator if total rewards are not viewed', async () => {
    mockLocalStorage.state = { last_viewed_total_rewards: '598' };

    const { storeState } = await expectSaga(checkNewRewardsLoaded)
      .withReducer(rootReducer, initialState({ meowPreviousDay: '599' }))
      .run();

    expect(storeState.rewards.showNewRewardsIndicator).toEqual(true);
  });

  it('opens rewards tooltip if the previous day rewards are not viewed', async () => {
    mockLocalStorage.state = { last_viewed_day_rewards: '888' }; // different from meowPreviousDay

    const { storeState } = await expectSaga(checkNewRewardsLoaded)
      .withReducer(rootReducer, initialState({ meowPreviousDay: '599' }))
      .spawn(closeRewardsTooltipAfterDelay)
      .run();

    expect(storeState.rewards.showRewardsInTooltip).toEqual(true);
  });
});

describe(transferMeow, () => {
  it('handles successful MEOW transfer', async () => {
    const meowSenderId = 'sender-id';
    const postOwnerId = 'post-owner-id';
    const meowAmount = '500000000000000000';

    const apiResponse = {
      success: true,
      response: {
        senderBalance: '500000000000000000',
        recipientBalance: '1000000000000000000',
      },
    };

    const { storeState } = await expectSaga(transferMeow, {
      payload: { meowSenderId, postOwnerId, meowAmount },
    })
      .withReducer(rootReducer, initialState())
      .provide([[call(transferMeowAPI, meowSenderId, postOwnerId, meowAmount), apiResponse]])
      .run();

    expect(storeState.rewards.meow).toEqual('500000000000000000');
  });

  it('handles meowSenderId is equal to postOwnerId failure', async () => {
    const meowSenderId = 'sender-id';
    const postOwnerId = 'sender-id';
    const meowAmount = '500000000000000000';

    const { storeState } = await expectSaga(transferMeow, {
      payload: { meowSenderId, postOwnerId, meowAmount },
    })
      .withReducer(rootReducer, initialState())
      .run();

    expect(storeState.rewards.transferError).toEqual('Cannot transfer MEOW to yourself.');
  });

  it('handles API MEOW transfer failure', async () => {
    const meowSenderId = 'sender-id';
    const postOwnerId = 'post-owner-id';
    const meowAmount = '500000000000000000';

    const apiResponse = {
      success: false,
      error: 'Transfer failed.',
    };

    const { storeState } = await expectSaga(transferMeow, {
      payload: { meowSenderId, postOwnerId, meowAmount },
    })
      .withReducer(rootReducer, initialState())
      .provide([[call(transferMeowAPI, meowSenderId, postOwnerId, meowAmount), apiResponse]])
      .run();

    expect(storeState.rewards.transferError).toEqual('Transfer failed.');
  });

  it('handles unexpected error during MEOW transfer', async () => {
    const meowSenderId = 'sender-id';
    const postOwnerId = 'post-owner-id';
    const meowAmount = '500000000000000000';

    const error = new Error('Network error');

    const { storeState } = await expectSaga(transferMeow, {
      payload: { meowSenderId, postOwnerId, meowAmount },
    })
      .withReducer(rootReducer, initialState())
      .provide([[call(transferMeowAPI, meowSenderId, postOwnerId, meowAmount), Promise.reject(error)]])
      .run();

    expect(storeState.rewards.transferError).toEqual('Network error');
  });

  it('handles transfer loading', async () => {
    const meowSenderUserId = 'sender-id';
    const postOwnerId = 'post-owner-id';
    const meowAmount = '500000000000000000';

    const apiResponse = {
      success: true,
      response: {
        senderBalance: '500000000000000000',
        recipientBalance: '1000000000000000000',
      },
    };

    const { storeState } = await expectSaga(transferMeow, {
      payload: { meowSenderUserId, postOwnerId, meowAmount },
    })
      .withReducer(rootReducer, initialState())
      .provide([[call(transferMeowAPI, meowSenderUserId, postOwnerId, meowAmount), apiResponse]])
      .run();

    expect(storeState.rewards.transferLoading).toEqual(false);
  });
});

describe('updateUserMeowBalance', () => {
  it('updates the current user MEOW balance correctly', async () => {
    const postOwnerId = 'user-id';
    const amount = 10; // Amount in MEOWs to be converted to Wei

    const initialMeowBalance = '1000000000000000000'; // 1 MEOW in Wei

    const { storeState } = await expectSaga(updateUserMeowBalance, postOwnerId, amount)
      .withReducer(rootReducer, initialState({ meow: initialMeowBalance }))
      .run();

    const expectedNewBalance = new BN(initialMeowBalance)
      .add(new BN(amount).mul(new BN('1000000000000000000')))
      .toString();

    expect(storeState.rewards.meow).toEqual(expectedNewBalance);
  });

  it('does not update MEOW balance if post owner is not the current user', async () => {
    const postOwnerId = 'another-user-id';
    const amount = 10; // Amount in MEOWs to be converted to Wei

    const initialMeowBalance = '1000000000000000000'; // 1 MEOW in Wei

    const { storeState } = await expectSaga(updateUserMeowBalance, postOwnerId, amount)
      .withReducer(rootReducer, initialState({ meow: initialMeowBalance }))
      .run();

    expect(storeState.rewards.meow).toEqual(initialMeowBalance); // Balance should remain unchanged
  });
});

function initialState(attrs: Partial<RewardsState> = {}, otherAttrs: any = {}) {
  return {
    rewards: {
      ...initialRewardsState,
      meowInUSD: 0.03,
      ...attrs,
    },
    registration: {
      isFirstTimeLogin: false,
    },
    authentication: {
      user: {
        data: {
          id: 'user-id',
        },
      },
    },
    ...otherAttrs,
  } as any;
}
