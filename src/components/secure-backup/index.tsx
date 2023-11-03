import * as React from 'react';

import { Alert, Button, IconButton, Input } from '@zero-tech/zui/components';

import { clipboard } from '../../lib/clipboard';

import { bemClassName } from '../../lib/bem';
import './styles.scss';
import { IconXClose } from '@zero-tech/zui/icons';

const cn = bemClassName('secure-backup');

export interface Clipboard {
  write: (text: string) => Promise<void>;
}

export interface Properties {
  recoveryKey: string;
  backupExists: boolean;
  isBackupRecovered: boolean;
  successMessage: string;
  errorMessage: string;

  clipboard?: Clipboard;

  onClose: () => void;
  onGenerate: () => void;
  onSave: () => void;
  onRestore: (recoveryKey) => void;
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

  get isRecovered() {
    return this.props.backupExists && this.props.isBackupRecovered && !this.props.recoveryKey;
  }

  get noBackupExists() {
    return !this.props.backupExists && !this.props.recoveryKey;
  }

  get backupNotRestored() {
    return this.props.backupExists && !this.props.isBackupRecovered;
  }

  renderBackedUpMode() {
    return (
      <div {...cn('backed-up')}>
        <p>This session is backing up your keys.</p>
        <p>This backup is trusted because it has been restored on this session.</p>
        {this.renderButtons(<Button onPress={() => this.props.onGenerate()}>Generate new backup</Button>)}
      </div>
    );
  }

  renderNoBackupMode() {
    return (
      <>
        <p>
          Your keys are <b>not being backed up from this session.</b>
        </p>
        <p>Back up your keys before signing out to avoid losing them.</p>
        {this.renderButtons(<Button onPress={() => this.props.onGenerate()}>Generate backup</Button>)}
      </>
    );
  }

  renderCreationMode() {
    return (
      <>
        <p>
          The following recovery key has been generated for you. Click `Copy` to copy it to your clipboard. Store it in
          a secure place such as a password manager of vault then click `Save Backup` to complete the backup process.
        </p>
        {this.props.recoveryKey && <div {...cn('recovery-key')}>{this.props.recoveryKey}</div>}
        {this.renderButtons(
          <>
            {this.props.recoveryKey && <Button onPress={this.copyKey}>Copy</Button>}
            <Button onPress={() => this.props.onSave()} isDisabled={!this.state.hasCopied}>
              Save backup
            </Button>
          </>
        )}
      </>
    );
  }

  renderRestoreMode() {
    return (
      <>
        <Input
          placeholder='Enter your recovery key'
          onChange={this.trackRecoveryKey}
          value={this.state.userInputRecoveryKey}
        />
        {this.renderButtons(
          <Button onPress={() => this.props.onRestore(this.state.userInputRecoveryKey)}>Restore backup</Button>
        )}
      </>
    );
  }

  renderButtons = (buttons) => {
    return (
      <>
        <div {...cn('messages')}>
          {this.props.successMessage && <Alert variant='success'>{this.props.successMessage}</Alert>}
          {this.props.errorMessage && <Alert variant='error'>{this.props.errorMessage}</Alert>}
        </div>
        <div {...cn('footer')}>{buttons}</div>
      </>
    );
  };

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header')}>
          <h3 {...cn('title')}>Secure Backup</h3>
          <IconButton {...cn('close')} Icon={IconXClose} onClick={this.props.onClose} size={32} />
        </div>
        <p>
          Back up your encryption keys with your account data in case you lose access to your sessions. Your keys will
          be secured with a unique Security Key.
        </p>
        {this.isRecovered && this.renderBackedUpMode()}
        {this.noBackupExists && this.renderNoBackupMode()}
        {this.props.recoveryKey && this.renderCreationMode()}
        {this.backupNotRestored && this.renderRestoreMode()}
      </div>
    );
  }
}
