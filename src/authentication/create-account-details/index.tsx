import * as React from 'react';

import { Button, Input } from '@zero-tech/zui/components';

import './styles.scss';
import { bem } from '../../lib/bem';
const c = bem('create-account-details');

export interface Properties {
  isLoading: boolean;
  onCreate: (data: { name: string }) => void;
}

interface State {
  name: string;
}

export class CreateAccountDetails extends React.Component<Properties, State> {
  state = { name: '' };

  publishOnCreate = () => {
    this.props.onCreate({ name: this.state.name });
  };

  trackName = (value) => this.setState({ name: value });

  get isValid() {
    return this.state.name.trim().length > 0;
  }

  render() {
    return (
      <div className={c('')}>
        <h3 className={c('heading')}>CREATE YOUR ACCOUNT</h3>
        <div className={c('sub-heading')}>Step 2 of 2: What should we call you?</div>
        <form className={c('form')}>
          <Input
            label='What is your name?'
            helperText='This will be your name that is visible to others on Zero'
            name='name'
            value={this.state.name}
            onChange={this.trackName}
          />
          <Button
            className={c('button')}
            onPress={this.publishOnCreate}
            isDisabled={!this.isValid}
            isLoading={this.props.isLoading}
          >
            Create Account
          </Button>
        </form>
      </div>
    );
  }
}
