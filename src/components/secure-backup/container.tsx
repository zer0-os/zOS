import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { SecureBackup } from '.';
import { clearBackup, generateBackup, getBackup, restoreBackup, saveBackup } from '../../store/matrix';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  isLoaded: boolean;
  backupExists: boolean;
  isBackupRecovered: boolean;
  isLegacy: boolean;
  recoveryKey: string;
  successMessage: string;
  errorMessage: string;

  getBackup: () => void;
  generateBackup: () => void;
  saveBackup: () => void;
  restoreBackup: (recoveryKey: string) => void;
  clearBackup: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const { isLoaded, generatedRecoveryKey, trustInfo, successMessage, errorMessage } = state.matrix;
    return {
      isLoaded,
      backupExists: !!trustInfo,
      isBackupRecovered: trustInfo?.usable || trustInfo?.trustedLocally,
      isLegacy: trustInfo?.isLegacy,
      recoveryKey: generatedRecoveryKey || '',
      successMessage,
      errorMessage,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { generateBackup, saveBackup, restoreBackup, getBackup, clearBackup };
  }

  componentDidMount(): void {
    this.props.getBackup();
  }

  componentWillUnmount(): void {
    this.props.clearBackup();
  }

  render() {
    if (!this.props.isLoaded) {
      return null;
    }

    return (
      <SecureBackup
        backupExists={this.props.backupExists}
        isBackupRecovered={this.props.isBackupRecovered}
        isLegacy={this.props.isLegacy}
        recoveryKey={this.props.recoveryKey}
        successMessage={this.props.successMessage}
        errorMessage={this.props.errorMessage}
        onClose={this.props.onClose}
        onGenerate={this.props.generateBackup}
        onSave={this.props.saveBackup}
        onRestore={this.props.restoreBackup}
      />
    );
  }
}

export const SecureBackupContainer = connectContainer<PublicProperties>(Container);
