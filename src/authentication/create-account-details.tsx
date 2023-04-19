import * as React from 'react';

import { bem } from '../lib/bem';
import { Button, Input } from '@zero-tech/zui/components';
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
        <h1>Create Your Account</h1>
        <div>Step 2 of 2: What should we call you?</div>
        <Input
          label='What is your name?'
          helperText='This will be your name that is visible to others on Zero'
          name='name'
          value={this.state.name}
          onChange={this.trackName}
        />
        <Button onPress={this.publishOnCreate} isDisabled={!this.isValid} isLoading={this.props.isLoading}>
          Create Account
        </Button>
      </div>
    );
  }
}
