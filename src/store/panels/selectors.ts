import { RootState } from '../reducer';
import { Panel } from './constants';

export const getPanelOpenState = (state: RootState, panel: Panel): boolean => {
  return !!state.panels.openStates[panel];
};
