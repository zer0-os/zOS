import * as React from 'react';

import { bemClassName } from '../../../lib/bem';
import { assertAllValuesConsumed } from '../../../lib/enum';
import { RestoreBackupStage, RestoreProgress } from '../../../store/matrix';

import { BackupFAQ } from '../backup-faq';
import { RestorePrompt } from './restore-prompt';
import { RestoreBackup } from './restore-backup';
import { RecoveredBackup } from './recovered-backup';
import { Success } from './success';
import { Color, Modal } from '../../modal';
import { LoadingIndicator } from '@zero-tech/zui/components';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  isLoading: boolean;
  backupExists: boolean;
  backupRestored: boolean;
  successMessage: string;
  errorMessage: string;
  videoAssetsPath: string;
  backupStage: RestoreBackupStage;
  restoreProgress: RestoreProgress;

  onClose: () => void;
  onRestore: (recoveryKey) => void;
  onVerifyKey: () => void;
}

interface State {
  showFAQContent: boolean;
  hasCopiedKey: boolean;
  userInputKeyPhrase: string;
}

export class RestoreSecureBackup extends React.PureComponent<Properties, State> {
  state = {
    showFAQContent: false,
    hasCopiedKey: false,
    userInputKeyPhrase: '',
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

  enableVerifyButton = () => {
    this.setState({ hasCopiedKey: true });
  };

  trackKeyPhrase = (value) => {
    this.setState({ userInputKeyPhrase: value });
  };

  restoreBackup = () => {
    this.props.onRestore(this.state.userInputKeyPhrase);
    this.setState({ userInputKeyPhrase: '' });
  };

  proceedToVerifyKey = () => {
    this.props.onVerifyKey();
  };

  configForStage = () => {
    if (this.props.isLoading && this.props.backupStage !== RestoreBackupStage.RestoreBackup) {
      return { content: <LoadingIndicator /> };
    }

    if (this.state.showFAQContent) {
      return { content: <BackupFAQ onBack={this.closeFAQContent} /> };
    }

    const { backupStage, onClose, errorMessage, successMessage } = this.props;

    switch (backupStage) {
      case RestoreBackupStage.UserRestorePrompt:
        return {
          primaryText: 'Verify with backup phrase',
          onPrimary: this.proceedToVerifyKey,
          content: <RestorePrompt onLearnMore={this.openFAQContent} />,
        };

      case RestoreBackupStage.SystemRestorePrompt:
        return {
          primaryText: 'Verify with backup phrase',
          onPrimary: this.proceedToVerifyKey,
          secondaryText: 'Continue Without Verifying',
          secondaryColor: Color.Greyscale,
          onSecondary: onClose,
          content: <RestorePrompt isSystemPrompt onLearnMore={this.openFAQContent} />,
        };

      case RestoreBackupStage.RecoveredBackupInfo:
        return {
          primaryText: 'Dismiss',
          onPrimary: this.props.onClose,
          content: <RecoveredBackup onLearnMore={this.openFAQContent} />,
        };

      case RestoreBackupStage.RestoreBackup:
        return {
          primaryText: 'Verify',
          primaryDisabled: !this.state.userInputKeyPhrase,
          onPrimary: this.restoreBackup,
          content: (
            <RestoreBackup
              errorMessage={errorMessage}
              onChange={this.trackKeyPhrase}
              restoreProgress={this.props.restoreProgress}
            />
          ),
        };

      case RestoreBackupStage.Success:
        return {
          primaryText: 'Finish',
          onPrimary: this.props.onClose,
          content: <Success successMessage={successMessage} />,
        };

      default:
        assertAllValuesConsumed(backupStage);
    }
  };

  render() {
    const { primaryText, primaryDisabled, onPrimary, secondaryText, secondaryColor, onSecondary, content } =
      this.configForStage();

    return (
      <Modal
        title={this.title}
        primaryText={primaryText}
        primaryDisabled={primaryDisabled}
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
