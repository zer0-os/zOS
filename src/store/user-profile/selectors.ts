import { RootState } from '../reducer';

export const userProfileStageSelector = (state: RootState) => {
  return state.userProfile.stage;
};

export const showZeroProNotificationSelector = (state: RootState) => {
  return state.userProfile.showZeroProNotification;
};
