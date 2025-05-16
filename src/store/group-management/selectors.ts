import { RootState } from '../reducer';

export const isSecondarySidekickOpenSelector = (state: RootState) => state.groupManagement.isSecondarySidekickOpen;

export const leaveGroupDialogStatusSelector = (state: RootState) => state.groupManagement.leaveGroupDialogStatus;
