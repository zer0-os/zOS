import { RootState } from '../reducer';

export const selectedMainBackgroundSelector = (state: RootState) => {
  return state.background.selectedMainBackground;
};
