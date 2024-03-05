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
  onSave: (keyPhrase: string) => void;
}

export class VerifyKeyPhrase extends React.Component<Properties, State> {
  state = { userInputKeyPhrase: '' };

  trackKeyPhrase = (value) => {
    this.setState({ userInputKeyPhrase: value });
  };

  back = () => {
    this.props.onBack();
  };

  save = () => {
    this.props.onSave(this.keyPhrase);
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
              placeholder='Enter your backup phrase'
              onChange={this.trackKeyPhrase}
              value={this.keyPhrase}
              error={!!this.props.errorMessage}
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

          <Button {...cn('button')} onPress={this.save} isDisabled={!this.keyPhrase}>
            Verify and complete backup
          </Button>
        </div>
      </>
    );
  }
}
