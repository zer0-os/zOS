import * as React from 'react';

import { bemClassName } from '../../lib/bem';
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
import { VerifyKeyPhrase } from './verify-key-phrase';

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
  onSave: (recoveryKey) => void;
  onRestore: (recoveryKey) => void;
  onVerifyKey: () => void;
}

export class SecureBackup extends React.PureComponent<Properties> {
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

  renderHeader = () => {
    const title = this.backupNotRestored ? 'Verify Login' : 'Account Backup';

    return (
      <div {...cn('header')}>
        <h3 {...cn('title')}>{title}</h3>
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
      isLegacy,
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
      case BackupStage.UserGeneratePrompt:
        return <GeneratePrompt errorMessage={errorMessage} onGenerate={onGenerate} onClose={onClose} />;

      case BackupStage.UserRestorePrompt:
        return <RestorePrompt onNext={onVerifyKey} onClose={onClose} />;

      case BackupStage.SystemGeneratePrompt:
        return <GeneratePrompt isSystemPrompt errorMessage={errorMessage} onGenerate={onGenerate} onClose={onClose} />;

      case BackupStage.SystemRestorePrompt:
        return <RestorePrompt isSystemPrompt onNext={onVerifyKey} onClose={onClose} />;

      case BackupStage.RecoveredBackupInfo:
        return <RecoveredBackup onClose={onClose} onGenerate={onGenerate} isLegacy={isLegacy} />;

      case BackupStage.GenerateBackup:
        return <GenerateBackup recoveryKey={recoveryKey} errorMessage={errorMessage} onNext={onVerifyKey} />;

      case BackupStage.RestoreBackup:
        return <RestoreBackup onRestore={onRestore} errorMessage={errorMessage} />;

      case BackupStage.VerifyKeyPhrase:
        return <VerifyKeyPhrase errorMessage={errorMessage} onBack={onGenerate} onSave={onSave} />;

      case BackupStage.Success:
        return <Success successMessage={successMessage} onClose={onClose} />;

      default:
        assertNeverReached(backupStage);
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

// Ensure all enum values are handled
function assertNeverReached(x: never): never {
  throw new Error('Unexpected type: ' + x);
}
