import * as React from 'react';

import { Button, Input } from '@zero-tech/zui/components';

import './create-email-account.scss';
import { bem } from '../lib/bem';
const c = bem('create-email-account');

export interface Properties {
  onNext: (data: { email: string; password: string }) => void;
}

interface State {
  email: string;
  password: string;
}

export class CreateEmailAccount extends React.Component<Properties, State> {
  state = { email: '', password: '' };

  publishOnNext = () => {
    this.props.onNext({ email: this.state.email, password: this.state.password });
  };

  trackEmail = (value) => this.setState({ email: value });
  trackPassword = (value) => this.setState({ password: value });

  render() {
    return (
      <div className={c('')}>
        <h1>Create Email Account</h1>
        <div>Step 1 of 2: Enter your details</div>
        <Input label='Email Address' name='email' value={this.state.email} onChange={this.trackEmail} />
        <Input
          label='Password'
          type='password'
          name='password'
          value={this.state.password}
          onChange={this.trackPassword}
        />

        <Button onPress={this.publishOnNext}>Next</Button>
      </div>
    );
  }
}
