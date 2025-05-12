import { RootState } from '../reducer';

export const userRewardsMeowBalanceSelector = (state: RootState): string => state.rewards.meow;

export const isRewardsDialogOpenSelector = (state: RootState): boolean => state.rewards.showRewardsInPopup;
