import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Alert, Input } from '@zero-tech/zui/components';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface State {
  userInputRecoveryKey: string;
}

export interface Properties {
  errorMessage: string;
  onChange: (recoveryKey: string) => void;
}

export class RestoreBackup extends React.Component<Properties, State> {
  state = { userInputRecoveryKey: '' };

  trackRecoveryKey = (value) => {
    this.setState({ userInputRecoveryKey: value });
    this.props.onChange(value);
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
              placeholder='Enter your recovery key'
              onChange={this.trackRecoveryKey}
              value={this.recoveryKey}
              error={!!this.props.errorMessage}
            />

            {this.props.errorMessage && (
              <Alert {...cn('alert')} variant='error' isFilled>
                {this.props.errorMessage}
              </Alert>
            )}
          </div>
        </div>
      </>
    );
  }
}
