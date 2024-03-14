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

import './styles.scss';
import { Color, Modal } from '../modal';

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

  get title() {
    return this.existingBackupNotRestored ? 'Verify Login' : 'Account Backup';
  }

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

  configForStage = () => {
    if (this.state.showFAQContent) {
      return { content: <BackupFAQ onBack={this.closeFAQContent} /> };
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

    let content = null;
    switch (backupStage) {
      case BackupStage.UserGeneratePrompt:
        return {
          primaryText: 'Backup my account',
          onPrimary: onGenerate,
          content: <GeneratePrompt errorMessage={errorMessage} onLearnMore={this.openFAQContent} />,
        };

      case BackupStage.UserRestorePrompt:
        return {
          primaryText: 'Verify with backup phrase',
          onPrimary: onVerifyKey,
          content: <RestorePrompt onLearnMore={this.openFAQContent} />,
        };

      case BackupStage.SystemGeneratePrompt:
        return {
          primaryText: 'Backup my account',
          onPrimary: onGenerate,
          secondaryText: 'Backup later',
          secondaryColor: Color.Red,
          onSecondary: onClose,
          content: <GeneratePrompt isSystemPrompt errorMessage={errorMessage} onLearnMore={this.openFAQContent} />,
        };

      case BackupStage.SystemRestorePrompt:
        return {
          primaryText: 'Verify with backup phrase',
          onPrimary: onVerifyKey,
          secondaryText: 'Continue Without Verifying',
          secondaryColor: Color.Greyscale,
          onSecondary: onClose,
          content: <RestorePrompt isSystemPrompt onLearnMore={this.openFAQContent} />,
        };

      case BackupStage.RecoveredBackupInfo:
        return {
          primaryText: 'Dismiss',
          onPrimary: this.props.onClose,
          content: <RecoveredBackup onLearnMore={this.openFAQContent} />,
        };

      case BackupStage.GenerateBackup:
        content = <GenerateBackup recoveryKey={recoveryKey} errorMessage={errorMessage} onNext={onVerifyKey} />;
        break;

      case BackupStage.RestoreBackup:
        content = <RestoreBackup onRestore={onRestore} errorMessage={errorMessage} />;
        break;

      case BackupStage.VerifyKeyPhrase:
        content = <VerifyKeyPhrase errorMessage={errorMessage} onBack={onGenerate} onSave={onSave} />;
        break;

      case BackupStage.Success:
        return {
          primaryText: 'Finish',
          onPrimary: this.props.onClose,
          content: <Success successMessage={successMessage} />,
        };

      default:
        assertAllValuesConsumed(backupStage);
    }

    return {
      content,
    };
  };

  render() {
    const { primaryText, onPrimary, secondaryText, secondaryColor, onSecondary, content } = this.configForStage();

    return (
      <Modal
        title={this.title}
        primaryText={primaryText}
        secondaryText={secondaryText}
        secondaryColor={secondaryColor}
        onPrimary={onPrimary}
        onSecondary={onSecondary}
        onClose={this.props.onClose}
      >
        <div {...cn()}>
          {this.renderVideoBanner()}
          {content}
        </div>
      </Modal>
    );
  }
}
