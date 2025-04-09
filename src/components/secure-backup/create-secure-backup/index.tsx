import * as React from 'react';

import { bemClassName } from '../../../lib/bem';
import { assertAllValuesConsumed } from '../../../lib/enum';
import { CreateBackupStage } from '../../../store/matrix';

import { BackupFAQ } from '../backup-faq';
import { GeneratePrompt } from './generate-prompt';
import { GenerateBackup } from './generate-backup';
import { Success } from './success';
import { VerifyKeyPhrase } from './verify-key-phrase';
import { Color, Modal } from '../../modal';
import { LoadingIndicator } from '@zero-tech/zui/components';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  isLoading: boolean;
  recoveryKey: string;
  successMessage: string;
  errorMessage: string;
  videoAssetsPath: string;
  backupStage: CreateBackupStage;

  onClose: () => void;
  onGenerate: () => void;
  onSave: (recoveryKey) => void;
  onVerifyKey: () => void;
}

interface State {
  showFAQContent: boolean;
  hasCopiedKey: boolean;
  userInputKeyPhrase: string;
}

export class CreateSecureBackup extends React.PureComponent<Properties, State> {
  state = {
    showFAQContent: false,
    hasCopiedKey: false,
    userInputKeyPhrase: '',
  };

  openFAQContent = (): void => {
    this.setState({ showFAQContent: true });
  };

  closeFAQContent = (): void => {
    this.setState({ showFAQContent: false });
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

  enableVerifyButton = () => {
    this.setState({ hasCopiedKey: true });
  };

  moveToKeyPhraseVerify = () => {
    this.setState({ hasCopiedKey: false });
    this.props.onVerifyKey();
  };

  trackKeyPhrase = (value) => {
    this.setState({ userInputKeyPhrase: value });
  };

  returnToGenerate = () => {
    this.setState({ userInputKeyPhrase: '' });
    this.props.onGenerate();
  };

  saveBackup = () => {
    this.props.onSave(this.state.userInputKeyPhrase);
    this.setState({ userInputKeyPhrase: '' });
  };

  configForStage = () => {
    if (this.props.isLoading) {
      return { content: <LoadingIndicator /> };
    }

    if (this.state.showFAQContent) {
      return { content: <BackupFAQ onBack={this.closeFAQContent} /> };
    }

    const { backupStage, onGenerate, onClose, recoveryKey, errorMessage, successMessage } = this.props;

    let content = null;
    switch (backupStage) {
      case CreateBackupStage.UserGeneratePrompt:
        return {
          primaryText: 'Backup my account',
          onPrimary: onGenerate,
          content: <GeneratePrompt errorMessage={errorMessage} onLearnMore={this.openFAQContent} />,
        };

      case CreateBackupStage.SystemGeneratePrompt:
        return {
          primaryText: 'Backup my account',
          onPrimary: onGenerate,
          secondaryText: 'Backup later',
          secondaryColor: Color.Red,
          onSecondary: onClose,
          content: <GeneratePrompt isSystemPrompt errorMessage={errorMessage} onLearnMore={this.openFAQContent} />,
        };

      case CreateBackupStage.GenerateBackup:
        return {
          primaryText: "I've safely stored my backup",
          primaryDisabled: !this.state.hasCopiedKey,
          onPrimary: this.moveToKeyPhraseVerify,
          content: (
            <GenerateBackup
              recoveryKey={recoveryKey}
              errorMessage={errorMessage}
              onKeyCopied={this.enableVerifyButton}
            />
          ),
        };

      case CreateBackupStage.VerifyKeyPhrase:
        return {
          primaryText: 'Verify and complete backup',
          primaryDisabled: !this.state.userInputKeyPhrase,
          onPrimary: this.saveBackup,
          secondaryText: 'Back to phrase',
          secondaryColor: Color.Greyscale,
          onSecondary: this.returnToGenerate,
          content: <VerifyKeyPhrase errorMessage={errorMessage} onChange={this.trackKeyPhrase} />,
        };

      case CreateBackupStage.Success:
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
        title={'Account Backup'}
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
