import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Button } from '@zero-tech/zui/components';
import { IconAlertCircle, IconArrowRight } from '@zero-tech/zui/icons';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  isSystemPrompt?: boolean;
  errorMessage: string;

  onGenerate: () => void;
  onClose: () => void;
  onLearnMore: () => void;
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
      <div {...cn('animation-container')}>
        <p {...cn('primary-text')}>{this.renderPrimaryText()}</p>
        <div {...cn('learn-more')} onClick={this.props.onLearnMore}>
          Learn More <IconArrowRight size={20} />
        </div>

        <div {...cn('status-container', 'warning')}>
          <IconAlertCircle size={16} />
          <p {...cn('status-text')}>Your account is not backed up</p>
        </div>

        {this.props.errorMessage && <p {...cn('error-message')}>{this.props.errorMessage}</p>}

        <div {...cn('footer', `${this.props.isSystemPrompt && 'has-secondary-button'}`)}>
          {this.props.isSystemPrompt && (
            <Button {...cn('button')} onPress={this.close} variant='text'>
              Backup later
            </Button>
          )}

          <Button {...cn('button')} onPress={this.generateBackup}>
            Backup my account
          </Button>
        </div>
      </div>
    );
  }
}
