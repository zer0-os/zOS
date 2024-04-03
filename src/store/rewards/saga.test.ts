import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import { checkNewRewardsLoaded, closeRewardsTooltipAfterDelay, fetch, fetchCurrentMeowPriceInUSD } from './saga';
import { fetchRewards } from './api';
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
    ...otherAttrs,
  } as any;
}
