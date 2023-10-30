import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import { fetch } from './saga';
import { fetchRewards } from './api';
import { RewardsState, initialState as initialRewardsState } from '.';

import { rootReducer } from '../reducer';

describe('fetch', () => {
  it('fetches the rewards', async () => {
    const { storeState } = await expectSaga(fetch, { payload: {} })
      .provide([
        [
          call(fetchRewards, {}),
          { success: true, response: { meow: '517' } },
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .call(fetchRewards, {})
      .run();

    expect(storeState.rewards.meow).toEqual('517');
  });
});

function initialState(attrs: Partial<RewardsState> = {}) {
  return {
    rewards: {
      ...initialRewardsState,
      ...attrs,
    },
  } as any;
}
