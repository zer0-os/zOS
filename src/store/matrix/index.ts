import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  GetBackup = 'chat/get-backup',
  GenerateBackup = 'chat/generate-backup',
  SaveBackup = 'chat/save-backup',
  RestoreBackup = 'chat/restore-backup',
  ClearBackup = 'chat/clear-backup',
  DebugDeviceList = 'chat/debug-device-list',
  DebugRoomKeys = 'chat/debug-room-keys',
  FetchDeviceInfo = 'chat/fetch-device-info',
  // OpenBackupDialog = 'chat/open-backup-dialog',
  // CloseBackupDialog = 'chat/close-backup-dialog',
  // VerifyKey = 'chat/verify-key',
  OpenCreateBackupDialog = 'chat/open-create-backup-dialog',
  OpenRestoreBackupDialog = 'chat/open-restore-backup-dialog',
  CloseCreateBackupDialog = 'chat/close-create-backup-dialog',
  CloseRestoreBackupDialog = 'chat/close-restore-backup-dialog',
  VerifyCreatedKey = 'chat/verify-created-key',
  VerifyRestorationKey = 'chat/verify-restoration-key',
}

// export enum BackupStage {
//   UserGeneratePrompt = 'user_generate_prompt',
//   UserRestorePrompt = 'user_restore_prompt',
//   SystemGeneratePrompt = 'system_generate_prompt',
//   SystemRestorePrompt = 'system_restore_prompt',
//   RecoveredBackupInfo = 'recovered_backup_info',
//   VerifyKeyPhrase = 'verify_key_phrase',
//   GenerateBackup = 'generate_backup',
//   RestoreBackup = 'restore_backup',
//   Success = 'success',
// }

export enum CreateBackupStage {
  UserGeneratePrompt = 'user_generate_prompt',
  SystemGeneratePrompt = 'system_generate_prompt',
  GenerateBackup = 'generate_backup',
  VerifyKeyPhrase = 'verify_key_phrase',
  Success = 'success',
}

export enum RestoreBackupStage {
  UserRestorePrompt = 'user_restore_prompt',
  SystemRestorePrompt = 'system_restore_prompt',
  RestoreBackup = 'restore_backup',
  RecoveredBackupInfo = 'recovered_backup_info',
  Success = 'success',
}

export type GeneratedRecoveryKey = string | null;

export type RestoreProgress = {
  stage: string;
  total: number;
  successes: number;
  failures: number;
};

export const initialRestoreProgressState: RestoreProgress = {
  stage: '',
  total: 0,
  successes: 0,
  failures: 0,
};

export type MatrixState = {
  isLoaded: boolean;
  backupExists: boolean;
  backupRestored: boolean;
  generatedRecoveryKey: GeneratedRecoveryKey;
  successMessage: string;
  errorMessage: string;
  deviceId: string;
  // isBackupDialogOpen: boolean;
  isCreateBackupDialogOpen: boolean;
  isRestoreBackupDialogOpen: boolean;
  createBackupStage: CreateBackupStage;
  restoreBackupStage: RestoreBackupStage;
  restoreProgress: RestoreProgress;
};

export const initialState: MatrixState = {
  isLoaded: false,
  backupExists: false,
  backupRestored: false,
  generatedRecoveryKey: null,
  successMessage: '',
  errorMessage: '',
  deviceId: '',
  // isBackupDialogOpen: false,
  isCreateBackupDialogOpen: false,
  isRestoreBackupDialogOpen: false,
  createBackupStage: CreateBackupStage.UserGeneratePrompt,
  restoreBackupStage: RestoreBackupStage.UserRestorePrompt,
  restoreProgress: initialRestoreProgressState,
};

export const getBackup = createAction(SagaActionTypes.GetBackup);
export const generateBackup = createAction(SagaActionTypes.GenerateBackup);
export const saveBackup = createAction(SagaActionTypes.SaveBackup);
export const restoreBackup = createAction<string>(SagaActionTypes.RestoreBackup);
export const clearBackup = createAction(SagaActionTypes.ClearBackup);
export const debugDeviceList = createAction<string[]>(SagaActionTypes.DebugDeviceList);
export const debugRoomKeys = createAction<string>(SagaActionTypes.DebugRoomKeys);
export const fetchDeviceInfo = createAction<string[]>(SagaActionTypes.FetchDeviceInfo);
// export const openBackupDialog = createAction(SagaActionTypes.OpenBackupDialog);
// export const closeBackupDialog = createAction(SagaActionTypes.CloseBackupDialog);
// export const proceedToVerifyKey = createAction(SagaActionTypes.VerifyKey);
export const openCreateBackupDialog = createAction(SagaActionTypes.OpenCreateBackupDialog);
export const openRestoreBackupDialog = createAction(SagaActionTypes.OpenRestoreBackupDialog);
export const closeCreateBackupDialog = createAction(SagaActionTypes.CloseCreateBackupDialog);
export const closeRestoreBackupDialog = createAction(SagaActionTypes.CloseRestoreBackupDialog);
export const verifyCreatedKey = createAction(SagaActionTypes.VerifyCreatedKey);
export const verifyRestorationKey = createAction(SagaActionTypes.VerifyRestorationKey);

const slice = createSlice({
  name: 'matrix',
  initialState,
  reducers: {
    setLoaded: (state, action: PayloadAction<MatrixState['isLoaded']>) => {
      state.isLoaded = action.payload;
    },
    setGeneratedRecoveryKey: (state, action: PayloadAction<MatrixState['generatedRecoveryKey']>) => {
      state.generatedRecoveryKey = action.payload;
    },
    setSuccessMessage: (state, action: PayloadAction<MatrixState['successMessage']>) => {
      state.successMessage = action.payload;
    },
    setErrorMessage: (state, action: PayloadAction<MatrixState['errorMessage']>) => {
      state.errorMessage = action.payload;
    },
    setDeviceId: (state, action: PayloadAction<MatrixState['deviceId']>) => {
      state.deviceId = action.payload;
    },
    setIsCreateBackupDialogOpen: (state, action: PayloadAction<MatrixState['isCreateBackupDialogOpen']>) => {
      state.isCreateBackupDialogOpen = action.payload;
    },
    setIsRestoreBackupDialogOpen: (state, action: PayloadAction<MatrixState['isRestoreBackupDialogOpen']>) => {
      state.isRestoreBackupDialogOpen = action.payload;
    },
    // setIsBackupDialogOpen: (state, action: PayloadAction<MatrixState['isBackupDialogOpen']>) => {
    //   state.isBackupDialogOpen = action.payload;
    // },
    // setBackupStage: (state, action: PayloadAction<MatrixState['backupStage']>) => {
    //   state.backupStage = action.payload;
    // },
    setCreateBackupStage: (state, action: PayloadAction<MatrixState['createBackupStage']>) => {
      state.createBackupStage = action.payload;
    },
    setRestoreBackupStage: (state, action: PayloadAction<MatrixState['restoreBackupStage']>) => {
      state.restoreBackupStage = action.payload;
    },
    setBackupExists: (state, action: PayloadAction<MatrixState['backupExists']>) => {
      state.backupExists = action.payload;
    },
    setBackupRestored: (state, action: PayloadAction<MatrixState['backupRestored']>) => {
      state.backupRestored = action.payload;
    },
    setRestoreProgress: (state, action: PayloadAction<MatrixState['restoreProgress']>) => {
      state.restoreProgress = action.payload;
    },
  },
});

export const {
  setLoaded,
  // setIsBackupDialogOpen,
  setIsCreateBackupDialogOpen,
  setIsRestoreBackupDialogOpen,
  setGeneratedRecoveryKey,
  setSuccessMessage,
  setErrorMessage,
  setDeviceId,
  // setBackupStage,
  setCreateBackupStage,
  setRestoreBackupStage,
  setBackupExists,
  setBackupRestored,
  setRestoreProgress,
} = slice.actions;
export const { reducer } = slice;
