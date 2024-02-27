import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Alert, Button, Input } from '@zero-tech/zui/components';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface State {
  userInputRecoveryKey: string;
}

export interface Properties {
  errorMessage: string;
  onRestore: (recoveryKey: string) => void;
}

export class RestoreBackup extends React.Component<Properties, State> {
  state = { userInputRecoveryKey: '' };

  trackRecoveryKey = (value) => {
    this.setState({ userInputRecoveryKey: value });
  };

  restoreKey = () => {
    this.props.onRestore(this.recoveryKey);
  };

  get recoveryKey() {
    return this.state.userInputRecoveryKey;
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
              {...cn('input', `${this.props.errorMessage && 'error'}`)}
              placeholder='Enter your recovery key'
              onChange={this.trackRecoveryKey}
              value={this.recoveryKey}
            />

            {this.props.errorMessage && (
              <Alert {...cn('alert')} variant='error'>
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
