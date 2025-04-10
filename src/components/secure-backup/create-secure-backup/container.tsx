import * as React from 'react';

import { config } from '../../../config';

import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import {
  CreateBackupStage,
  clearBackup,
  generateBackup,
  getBackup,
  saveBackup,
  verifyCreatedKey,
} from '../../../store/matrix';

import { CreateSecureBackup } from '.';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  recoveryKey: string;
  successMessage: string;
  errorMessage: string;
  backupStage: CreateBackupStage;
  videoAssetsPath: string;

  getBackup: () => void;
  generateBackup: () => void;
  saveBackup: () => void;
  clearBackup: () => void;
  verifyCreatedKey: () => void;
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
      createBackupStage,
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
      backupStage: createBackupStage,
      restoreProgress,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { generateBackup, saveBackup, getBackup, clearBackup, verifyCreatedKey };
  }

  componentDidMount(): void {
    this.props.getBackup();
  }

  componentWillUnmount(): void {
    this.props.clearBackup();
  }

  render() {
    return (
      <CreateSecureBackup
        isLoading={this.props.isLoading}
        recoveryKey={this.props.recoveryKey}
        successMessage={this.props.successMessage}
        errorMessage={this.props.errorMessage}
        onClose={this.props.onClose}
        onGenerate={this.props.generateBackup}
        onSave={this.props.saveBackup}
        onVerifyKey={this.props.verifyCreatedKey}
        videoAssetsPath={this.props.videoAssetsPath}
        backupStage={this.props.backupStage}
      />
    );
  }
}

export const CreateSecureBackupContainer = connectContainer<PublicProperties>(Container);
