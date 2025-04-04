import * as React from 'react';

import { config } from '../../config';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import {
  BackupStage,
  clearBackup,
  generateBackup,
  getBackup,
  restoreBackup,
  saveBackup,
  proceedToVerifyKey,
  RestoreProgress,
} from '../../store/matrix';

import { SecureBackup } from '.';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  backupExists: boolean;
  backupRestored: boolean;
  recoveryKey: string;
  successMessage: string;
  errorMessage: string;
  backupStage: BackupStage;
  videoAssetsPath: string;
  restoreProgress: RestoreProgress;

  getBackup: () => void;
  generateBackup: () => void;
  saveBackup: () => void;
  restoreBackup: (recoveryKey: string) => void;
  clearBackup: () => void;
  proceedToVerifyKey: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      isLoaded,
      generatedRecoveryKey,
      backupExists,
      backupRestored,
      successMessage,
      errorMessage,
      backupStage,
      restoreProgress,
    } = state.matrix;

    return {
      isLoading: !isLoaded,
      backupExists,
      backupRestored,
      recoveryKey: generatedRecoveryKey || '',
      successMessage,
      errorMessage,
      videoAssetsPath: config.videoAssetsPath,
      backupStage,
      restoreProgress,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { generateBackup, saveBackup, restoreBackup, getBackup, clearBackup, proceedToVerifyKey };
  }

  componentDidMount(): void {
    this.props.getBackup();
  }

  componentWillUnmount(): void {
    this.props.clearBackup();
  }

  render() {
    return (
      <SecureBackup
        isLoading={this.props.isLoading}
        backupExists={this.props.backupExists}
        backupRestored={this.props.backupRestored}
        recoveryKey={this.props.recoveryKey}
        successMessage={this.props.successMessage}
        errorMessage={this.props.errorMessage}
        onClose={this.props.onClose}
        onGenerate={this.props.generateBackup}
        onSave={this.props.saveBackup}
        onRestore={this.props.restoreBackup}
        onVerifyKey={this.props.proceedToVerifyKey}
        videoAssetsPath={this.props.videoAssetsPath}
        backupStage={this.props.backupStage}
        restoreProgress={this.props.restoreProgress}
      />
    );
  }
}

export const SecureBackupContainer = connectContainer<PublicProperties>(Container);
