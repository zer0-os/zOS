import { RootState } from '../reducer';

export function userRewardsMeowBalanceSelector(state: RootState) {
  return state.rewards.meow;
}
