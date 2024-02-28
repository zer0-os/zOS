import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Button } from '@zero-tech/zui/components';
import { IconCheck } from '@zero-tech/zui/icons';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  onClose: () => void;
}

export class RecoveredBackup extends React.Component<Properties> {
  closeBackup = () => {
    this.props.onClose();
  };

  renderStatus = (text: string) => {
    return (
      <div {...cn('status-container', 'success')}>
        <IconCheck size={16} />
        <p {...cn('status-text')}>{text}</p>
      </div>
    );
  };

  render() {
    return (
      <>
        <p {...cn('primary-text')}>Access your encrypted messages between devices and logins with an account backup.</p>

        <div {...cn('status-group')}>
          {this.renderStatus('Your account has a backup phrase')}
          {this.renderStatus('Your current login is verified')}
        </div>

        <div {...cn('footer')}>
          <Button {...cn('button')} onPress={this.closeBackup}>
            Dismiss
          </Button>
        </div>
      </>
    );
  }
}
