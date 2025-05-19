import { RootState } from '../reducer';

export const backupExistsSelector = (state: RootState) => state.matrix.backupExists;
