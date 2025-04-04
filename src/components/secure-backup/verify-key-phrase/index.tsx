import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Alert, PasswordInput } from '@zero-tech/zui/components';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface State {
  userInputKeyPhrase: string;
}

export interface Properties {
  errorMessage: string;
  onChange: (keyPhrase: string) => void;
}

export class VerifyKeyPhrase extends React.Component<Properties, State> {
  state = { userInputKeyPhrase: '' };

  trackKeyPhrase = (value) => {
    this.setState({ userInputKeyPhrase: value });
    this.props.onChange(value);
  };

  get keyPhrase() {
    return this.state.userInputKeyPhrase;
  }

  render() {
    return (
      <>
        <div>
          <p {...cn('primary-text')}>Verify Backup Phrase</p>

          <p {...cn('secondary-text')}>Confirm that you have safely stored your backup phrase by entering it below</p>

          <div {...cn('input-container')}>
            <PasswordInput
              placeholder='Enter your backup phrase'
              onChange={this.trackKeyPhrase}
              value={this.keyPhrase}
              error={!!this.props.errorMessage}
              size='large'
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
