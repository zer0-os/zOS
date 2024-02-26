import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Alert, Button, Input } from '@zero-tech/zui/components';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  userInputRecoveryKey: string;
  errorMessage: string;

  trackRecoveryKey: (recoveryKey: string) => void;
  onRestore: (recoveryKey: string) => void;
}

export class RestoreBackup extends React.Component<Properties> {
  restoreKey = () => {
    this.props.onRestore(this.recoveryKey);
  };

  get recoveryKey() {
    return this.props.userInputRecoveryKey;
  }

  render() {
    return (
      <>
        <div>
          <p {...cn('primary-text')}>Account backup phrase</p>

          <p {...cn('secondary-text')}>
            Entering your account backup phrase may restore access to previous messages in your conversations. Case
            sensitive.
          </p>

          <div {...cn('input-container')}>
            <Input
              placeholder='Enter your recovery key'
              onChange={this.props.trackRecoveryKey}
              value={this.recoveryKey}
            />

            {this.props.errorMessage && (
              <Alert {...cn('error-message')} variant='error'>
                {this.props.errorMessage}
              </Alert>
            )}
          </div>
        </div>

        <div {...cn('footer')}>
          <Button {...cn('button')} onPress={this.restoreKey} isDisabled={!this.recoveryKey}>
            Verify
          </Button>
        </div>
      </>
    );
  }
}
