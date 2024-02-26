import { ModalConfirmation } from '@zero-tech/zui/components';
import * as React from 'react';

export interface Properties {
  backupExists: boolean;
  backupVerified: boolean;
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
      <ModalConfirmation
        open
        title='Are you sure?'
        cancelLabel='Cancel'
        confirmationLabel='Log Out'
        onCancel={() => null}
        onConfirm={() => null}
        inProgress={false}
      >
        <div>
          {!this.props.backupExists && this.noBackupText}
          {this.props.backupExists && !this.props.backupVerified && this.unverifiedText}
          {this.props.backupExists && this.props.backupVerified && this.logoutWarningText}
        </div>
      </ModalConfirmation>
    );
  }
}
