import { RootState } from '../reducer';
import { Panel } from './constants';

export const getPanelOpenState = (state: RootState, panel: Panel | undefined): boolean => {
  if (!panel) return false;
  return !!state.panels.openStates[panel];
};
