import * as React from 'react';

import { config } from '../../../config';

import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import {
  RestoreBackupStage,
  clearBackup,
  getBackup,
  restoreBackup,
  verifyRestorationKey,
  RestoreProgress,
} from '../../../store/matrix';

import { RestoreSecureBackup } from '.';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  backupExists: boolean;
  backupRestored: boolean;
  successMessage: string;
  errorMessage: string;
  backupStage: RestoreBackupStage;
  videoAssetsPath: string;
  restoreProgress: RestoreProgress;

  getBackup: () => void;
  restoreBackup: (recoveryKey: string) => void;
  clearBackup: () => void;
  verifyRestorationKey: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const {
      isLoaded,
      backupExists,
      backupRestored,
      successMessage,
      errorMessage,
      restoreBackupStage,
      restoreProgress,
    } = state.matrix;

    return {
      isLoading: !isLoaded,
      backupExists,
      backupRestored,
      successMessage,
      errorMessage,
      videoAssetsPath: config.videoAssetsPath,
      backupStage: restoreBackupStage,
      restoreProgress,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { restoreBackup, getBackup, clearBackup, verifyRestorationKey };
  }

  componentDidMount(): void {
    this.props.getBackup();
  }

  componentWillUnmount(): void {
    this.props.clearBackup();
  }

  render() {
    return (
      <RestoreSecureBackup
        isLoading={this.props.isLoading}
        backupExists={this.props.backupExists}
        backupRestored={this.props.backupRestored}
        successMessage={this.props.successMessage}
        errorMessage={this.props.errorMessage}
        onClose={this.props.onClose}
        onRestore={this.props.restoreBackup}
        onVerifyKey={this.props.verifyRestorationKey}
        videoAssetsPath={this.props.videoAssetsPath}
        backupStage={this.props.backupStage}
        restoreProgress={this.props.restoreProgress}
      />
    );
  }
}

export const RestoreSecureBackupContainer = connectContainer<PublicProperties>(Container);
