import { RootState } from '../reducer';

export const userProfileStageSelector = (state: RootState) => {
  return state.userProfile.stage;
};
