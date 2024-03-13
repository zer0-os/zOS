import * as React from 'react';

import { bemClassName } from '../../lib/bem';
import { assertAllValuesConsumed } from '../../lib/enum';
import { BackupStage } from '../../store/matrix';

import { BackupFAQ } from './backup-faq';
import { GeneratePrompt } from './generate-prompt';
import { GenerateBackup } from './generate-backup';
import { RestorePrompt } from './restore-prompt';
import { RestoreBackup } from './restore-backup';
import { RecoveredBackup } from './recovered-backup';
import { Success } from './success';
import { VerifyKeyPhrase } from './verify-key-phrase';

import { IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';

import './styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  recoveryKey: string;
  backupExists: boolean;
  backupRestored: boolean;
  successMessage: string;
  errorMessage: string;
  videoAssetsPath: string;
  backupStage: BackupStage;

  onClose: () => void;
  onGenerate: () => void;
  onSave: (recoveryKey) => void;
  onRestore: (recoveryKey) => void;
  onVerifyKey: () => void;
}

interface State {
  showFAQContent: boolean;
}

export class SecureBackup extends React.PureComponent<Properties, State> {
  state = {
    showFAQContent: false,
  };

  get existingBackupNotRestored() {
    return this.props.backupExists && !this.props.backupRestored;
  }

  openFAQContent = (): void => {
    this.setState({ showFAQContent: true });
  };

  closeFAQContent = (): void => {
    this.setState({ showFAQContent: false });
  };

  renderHeader = () => {
    const title = this.existingBackupNotRestored ? 'Verify Login' : 'Account Backup';

    return (
      <div {...cn('header')}>
        <h3 {...cn('title')}>{title}</h3>
        <IconButton {...cn('close')} Icon={IconXClose} onClick={this.props.onClose} size={40} />
      </div>
    );
  };

  renderVideoBanner = () => {
    if (this.state.showFAQContent) {
      return null;
    }

    return (
      <div {...cn('video-banner')}>
        <video {...cn('video')} src={`${this.props.videoAssetsPath}/E2EEncryption.mp4`} autoPlay loop muted />
      </div>
    );
  };

  renderBackupContent = () => {
    if (this.state.showFAQContent) {
      return <BackupFAQ onBack={this.closeFAQContent} />;
    }

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
      case BackupStage.UserGeneratePrompt:
        return (
          <GeneratePrompt
            errorMessage={errorMessage}
            onGenerate={onGenerate}
            onClose={onClose}
            onLearnMore={this.openFAQContent}
          />
        );

      case BackupStage.UserRestorePrompt:
        return <RestorePrompt onNext={onVerifyKey} onClose={onClose} onLearnMore={this.openFAQContent} />;

      case BackupStage.SystemGeneratePrompt:
        return (
          <GeneratePrompt
            isSystemPrompt
            errorMessage={errorMessage}
            onGenerate={onGenerate}
            onClose={onClose}
            onLearnMore={this.openFAQContent}
          />
        );

      case BackupStage.SystemRestorePrompt:
        return (
          <RestorePrompt isSystemPrompt onNext={onVerifyKey} onClose={onClose} onLearnMore={this.openFAQContent} />
        );

      case BackupStage.RecoveredBackupInfo:
        return <RecoveredBackup onClose={onClose} onLearnMore={this.openFAQContent} />;

      case BackupStage.GenerateBackup:
        return <GenerateBackup recoveryKey={recoveryKey} errorMessage={errorMessage} onNext={onVerifyKey} />;

      case BackupStage.RestoreBackup:
        return <RestoreBackup onRestore={onRestore} errorMessage={errorMessage} />;

      case BackupStage.VerifyKeyPhrase:
        return <VerifyKeyPhrase errorMessage={errorMessage} onBack={onGenerate} onSave={onSave} />;

      case BackupStage.Success:
        return <Success successMessage={successMessage} onClose={onClose} />;

      default:
        assertAllValuesConsumed(backupStage);
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
