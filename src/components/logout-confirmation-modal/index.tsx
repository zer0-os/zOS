import * as React from 'react';

import { Modal } from '../modal';
import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('logout-confirmation-modal');

export interface Properties {
  backupExists: boolean;
  backupVerified: boolean;

  onClose: () => void;
  onLogout: () => void;
}

export class LogoutConfirmationModal extends React.Component<Properties> {
  get noBackupText() {
    return (
      <>
        <p>You have not created an account backup. If you log out, you will lose some of your message history.</p>
        <p>You can backup your account in settings.</p>
      </>
    );
  }

  get unverifiedText() {
    return (
      <>
        <p>
          You have not verified your login. If you log out, you will lose some of your message history. If this is your
          only active login, you will not be able to see messages you receive while logged out.
        </p>
        <p>You can verify your account in settings.</p>
      </>
    );
  }

  get logoutWarningText() {
    return (
      <>
        <p>
          You will need to enter your backup phrase to see your message history when you log in again. If this is your
          only active login, you will not be able to see messages you receive while logged out.
        </p>
      </>
    );
  }

  render() {
    return (
      <Modal
        title='Are you sure?'
        primaryText='Log Out'
        secondaryText='Cancel'
        onPrimary={this.props.onLogout}
        onSecondary={this.props.onClose}
        onClose={this.props.onClose}
      >
        <div {...cn()}>
          {!this.props.backupExists && this.noBackupText}
          {this.props.backupExists && !this.props.backupVerified && this.unverifiedText}
          {this.props.backupExists && this.props.backupVerified && this.logoutWarningText}
        </div>
      </Modal>
    );
  }
}
