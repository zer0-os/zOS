import * as React from 'react';

import { bemClassName } from '../../lib/bem';
import { clipboard } from '../../lib/clipboard';
import { BackupStage } from '../../store/matrix';

import { GeneratePrompt } from './generate-prompt';
import { GenerateBackup } from './generate-backup';
import { RestorePrompt } from './restore-prompt';
import { RestoreBackup } from './restore-backup';
import { RecoveredBackup } from './recovered-backup';
import { Success } from './success';

import { IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';

import './styles.scss';

const cn = bemClassName('secure-backup');

export interface Clipboard {
  write: (text: string) => Promise<void>;
}

export interface Properties {
  recoveryKey: string;
  backupExists: boolean;
  isBackupRecovered: boolean;
  isLegacy: boolean;
  successMessage: string;
  errorMessage: string;
  videoAssetsPath: string;
  backupStage: BackupStage;

  clipboard?: Clipboard;

  onClose: () => void;
  onGenerate: () => void;
  onSave: () => void;
  onRestore: (recoveryKey) => void;
  onVerifyKey: () => void;
}

export interface State {
  userInputRecoveryKey: string;
  hasCopied: boolean;
}

export class SecureBackup extends React.PureComponent<Properties, State> {
  static defaultProps = { clipboard: clipboard };

  state = { userInputRecoveryKey: '', hasCopied: false };

  copyKey = () => {
    this.props.clipboard.write(this.props.recoveryKey);
    this.setState({ hasCopied: true });
  };

  trackRecoveryKey = (value) => {
    this.setState({ userInputRecoveryKey: value });
  };

  get backupStage() {
    return this.props.backupStage;
  }

  get isRecovered() {
    return this.props.backupExists && this.props.isBackupRecovered && !this.props.recoveryKey;
  }

  get noBackupExists() {
    return !this.props.backupExists && !this.props.recoveryKey;
  }

  get backupNotRestored() {
    return this.props.backupExists && !this.props.isBackupRecovered;
  }

  get isSystemPrompt() {
    return this.backupStage === BackupStage.SystemPrompt;
  }

  renderHeader = () => {
    return (
      <div {...cn('header')}>
        <h3 {...cn('title')}>Account Backup</h3>
        <IconButton {...cn('close')} Icon={IconXClose} onClick={this.props.onClose} size={40} />
      </div>
    );
  };

  renderVideoBanner = () => {
    return (
      <div {...cn('video-banner')}>
        <video {...cn('video')} src={`${this.props.videoAssetsPath}/E2EEncryption.mp4`} autoPlay loop muted />
      </div>
    );
  };

  renderBackupContent = () => {
    const {
      backupStage,
      onGenerate,
      onRestore,
      onVerifyKey,
      onClose,
      onSave,
      recoveryKey,
      errorMessage,
      successMessage,
    } = this.props;

    switch (backupStage) {
      case BackupStage.None:
      case BackupStage.SystemPrompt:
        return (
          <>
            {this.noBackupExists && (
              <GeneratePrompt
                isSystemPrompt={this.isSystemPrompt}
                onGenerate={onGenerate}
                onClose={this.props.onClose}
              />
            )}

            {this.backupNotRestored && (
              <RestorePrompt
                isSystemPrompt={this.isSystemPrompt}
                onVerifyKey={onVerifyKey}
                onClose={this.props.onClose}
              />
            )}

            {this.isRecovered && (
              <RecoveredBackup onClose={onClose} onGenerate={this.props.onGenerate} isLegacy={this.props.isLegacy} />
            )}
          </>
        );

      case BackupStage.GenerateBackup:
        return (
          <GenerateBackup
            recoveryKey={recoveryKey}
            errorMessage={errorMessage}
            hasCopied={this.state.hasCopied}
            onCopy={this.copyKey}
            onSave={onSave}
          />
        );

      case BackupStage.RestoreBackup:
        return (
          <RestoreBackup
            userInputRecoveryKey={this.state.userInputRecoveryKey}
            errorMessage={errorMessage}
            trackRecoveryKey={this.trackRecoveryKey}
            onRestore={onRestore}
          />
        );

      case BackupStage.Success:
        return <Success successMessage={successMessage} onClose={onClose} />;

      default:
        return null;
    }
  };

  render() {
    return (
      <div {...cn()}>
        {this.renderHeader()}
        {this.renderVideoBanner()}
        {this.renderBackupContent()}
      </div>
    );
  }
}
