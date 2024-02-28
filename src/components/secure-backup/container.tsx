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
} from '../../store/matrix';

import { SecureBackup } from '.';

import { LoadingIndicator } from '@zero-tech/zui/components';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  isLoaded: boolean;
  backupExists: boolean;
  backupRecovered: boolean;
  isLegacy: boolean;
  recoveryKey: string;
  successMessage: string;
  errorMessage: string;
  backupStage: BackupStage;
  videoAssetsPath: string;

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
      trustInfo,
      backupExists,
      backupRestored,
      successMessage,
      errorMessage,
      backupStage,
    } = state.matrix;
    return {
      isLoaded,
      backupExists,
      isBackupRecovered: backupRestored,
      isLegacy: trustInfo?.isLegacy,
      recoveryKey: generatedRecoveryKey || '',
      successMessage,
      errorMessage,
      videoAssetsPath: config.videoAssetsPath,
      backupStage,
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
    if (!this.props.isLoaded) {
      return <LoadingIndicator />;
    }

    return (
      <SecureBackup
        backupExists={this.props.backupExists}
        backupRecovered={this.props.backupRecovered}
        isLegacy={this.props.isLegacy}
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
      />
    );
  }
}

export const SecureBackupContainer = connectContainer<PublicProperties>(Container);
