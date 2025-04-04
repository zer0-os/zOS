import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Alert, PasswordInput } from '@zero-tech/zui/components';
import { RestoreProgress } from '../../../store/matrix';
import { ProgressTracker } from './progress-tracker';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface State {
  userInputRecoveryKey: string;
}

export interface Properties {
  errorMessage: string;
  restoreProgress: RestoreProgress;

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
            <PasswordInput
              placeholder='Enter your recovery key'
              onChange={this.trackRecoveryKey}
              value={this.recoveryKey}
              error={!!this.props.errorMessage}
              size='large'
            />

            {this.props.errorMessage && (
              <Alert {...cn('alert')} variant='error' isFilled>
                {this.props.errorMessage}
              </Alert>
            )}
          </div>

          {!this.props.errorMessage && <ProgressTracker progress={this.props.restoreProgress} />}
        </div>
      </>
    );
  }
}
