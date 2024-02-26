import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Button } from '@zero-tech/zui/components';
import { IconAlertCircle, IconCheck } from '@zero-tech/zui/icons';

import '../styles.scss';

const cn = bemClassName('secure-backup');

enum Status {
  Success = 'success',
  Warning = 'warning',
}

export interface Properties {
  isSystemPrompt: boolean;

  onVerifyKey: () => void;
  onClose?: () => void;
}

export class RestorePrompt extends React.Component<Properties> {
  close = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  navigateToVerifyWithKey = () => {
    this.props.onVerifyKey();
  };

  renderStatus = (status: Status, text: string) => {
    const icon = status === Status.Success ? <IconCheck size={16} /> : <IconAlertCircle size={16} />;

    return (
      <div {...cn('status-container', `${status}`)}>
        {icon} <p {...cn('status-text')}>{text}</p>
      </div>
    );
  };

  renderPrimaryText = () => {
    if (this.props.isSystemPrompt) {
      return 'It looks like this is a new device or login. Enter your account backup phrase to maintain access to your messages.';
    }

    return 'Access your encrypted messages between devices and logins with an account backup.';
  };

  render() {
    return (
      <>
        <p {...cn('primary-text')}>{this.renderPrimaryText()}</p>

        <div {...cn('status-group')}>
          {this.renderStatus(Status.Success, 'Your account has a backup phrase')}
          {this.renderStatus(Status.Warning, 'Your current login is not verified, some messages may be hidden')}
        </div>

        <div {...cn('footer', `${this.props.isSystemPrompt && 'hasSecondaryButton'}`)}>
          {this.props.isSystemPrompt && (
            <Button {...cn('button')} onPress={this.close} variant='text'>
              Continue without verifying
            </Button>
          )}

          <Button {...cn('button')} onPress={this.navigateToVerifyWithKey}>
            Verify with backup phrase
          </Button>
        </div>
      </>
    );
  }
}
