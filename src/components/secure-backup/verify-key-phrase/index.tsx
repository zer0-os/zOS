import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { Alert, Button, Input } from '@zero-tech/zui/components';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface State {
  userInputKeyPhrase: string;
}

export interface Properties {
  errorMessage: string;
  onBack: () => void;
  onSubmit: (keyPhrase: string) => void;
}

export class VerifyKeyPhrase extends React.Component<Properties, State> {
  state = { userInputKeyPhrase: '' };

  trackKeyPhrase = (value) => {
    this.setState({ userInputKeyPhrase: value });
  };

  back = () => {
    this.props.onBack();
  };

  submitKeyPhrase = () => {
    this.props.onSubmit(this.keyPhrase);
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
            <Input
              {...cn('input', `${this.props.errorMessage && 'error'}`)}
              placeholder='Enter your backup phrase'
              onChange={this.trackKeyPhrase}
              value={this.keyPhrase}
            />

            {this.props.errorMessage && (
              <Alert {...cn('alert')} variant='error'>
                {this.props.errorMessage}
              </Alert>
            )}
          </div>
        </div>

        <div {...cn('footer', 'has-secondary-button')}>
          <Button {...cn('button')} onPress={this.back} variant='text'>
            Back to phrase
          </Button>

          <Button {...cn('button')} onPress={this.submitKeyPhrase} isDisabled={!this.keyPhrase}>
            Verify and complete backup
          </Button>
        </div>
      </>
    );
  }
}
