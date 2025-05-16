import { CreateBackupStage, initialRestoreProgressState, MatrixState, RestoreBackupStage } from '..';

export const mockMatrixState: MatrixState = {
  isLoaded: false,
  backupExists: false,
  backupRestored: false,
  generatedRecoveryKey: null,
  successMessage: '',
  errorMessage: '',
  deviceId: '',
  isCreateBackupDialogOpen: false,
  isRestoreBackupDialogOpen: false,
  createBackupStage: CreateBackupStage.UserGeneratePrompt,
  restoreBackupStage: RestoreBackupStage.UserRestorePrompt,
  restoreProgress: initialRestoreProgressState,
};
