import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Button } from '@zero-tech/zui/components';
import { IconAlertCircle } from '@zero-tech/zui/icons';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  isSystemPrompt: boolean;

  onGenerate: () => void;
  onClose?: () => void;
}

export class GeneratePrompt extends React.Component<Properties> {
  close = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  generateBackup = () => {
    this.props.onGenerate();
  };

  renderPrimaryText = () => {
    if (this.props.isSystemPrompt) {
      return 'Now that you’re messaging, we strongly advise that you backup your account to prevent losing access to your messages';
    }
    return 'Access your encrypted messages between devices and logins with an account backup.';
  };

  render() {
    return (
      <>
        <p {...cn('primary-text')}>{this.renderPrimaryText()}</p>

        <div {...cn('status-container', 'warning')}>
          <IconAlertCircle size={16} />
          <p {...cn('status-text')}>Your account is not backed up</p>
        </div>

        <div {...cn('footer', `${this.props.isSystemPrompt && 'hasSecondaryButton'}`)}>
          {this.props.isSystemPrompt && (
            <Button {...cn('button')} onPress={this.close} variant='text'>
              Backup later
            </Button>
          )}

          <Button {...cn('button')} onPress={this.generateBackup}>
            Backup my account
          </Button>
        </div>
      </>
    );
  }
}
