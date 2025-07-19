import { RootState } from '../reducer';

export const errorsSelector = (state: RootState) => state.login.errors;
export const otpStageSelector = (state: RootState) => state.login.otpStage;
export const stageSelector = (state: RootState) => state.login.stage;
export const loadingSelector = (state: RootState) => state.login.loading;
