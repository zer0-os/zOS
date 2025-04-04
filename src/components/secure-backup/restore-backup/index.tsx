import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Alert, PasswordInput } from '@zero-tech/zui/components';

import '../styles.scss';
import { ProgressTracker } from './progress-tracker';

const cn = bemClassName('secure-backup');

export interface Properties {
  errorMessage?: string;
  restoreProgress?: {
    stage: string;
    total: number;
    successes: number;
    failures: number;
  };
  onChange: (value: string) => void;
}

interface State {
  userInputRecoveryKey: string;
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

  isRestorationInProgress() {
    return this.props.restoreProgress && this.props.restoreProgress.stage !== '';
  }

  render() {
    const isRestorationInProgress = this.isRestorationInProgress();

    return (
      <>
        <div>
          {!isRestorationInProgress ? (
            <>
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
            </>
          ) : (
            <>
              <p {...cn('primary-text')}>Restoring Your Encrypted Messages</p>
              <p {...cn('secondary-text')}>
                We're restoring access to your encrypted messages. This may take a moment depending on how many messages
                you have.
              </p>
            </>
          )}

          {!this.props.errorMessage && <ProgressTracker progress={this.props.restoreProgress} />}
        </div>
      </>
    );
  }
}
