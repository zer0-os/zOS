import * as React from 'react';

import { Button, Input, PasswordInput } from '@zero-tech/zui/components';

import './styles.scss';
import { bem } from '../../lib/bem';
const c = bem('create-email-account');

export interface Properties {
  isLoading: boolean;

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

  get isValid() {
    return this.state.email.trim().length > 0 && this.state.password.trim().length > 0;
  }

  render() {
    return (
      <div className={c('')}>
        <h3 className={c('heading')}>CREATE YOUR ACCOUNT</h3>
        <div className={c('sub-heading')}>Step 1 of 2: Enter your details</div>
        <form className={c('form')}>
          <Input label='Email Address' name='email' value={this.state.email} onChange={this.trackEmail} />
          <PasswordInput label='Password' name='password' value={this.state.password} onChange={this.trackPassword} />

          <Button
            className={c('button')}
            onPress={this.publishOnNext}
            isDisabled={!this.isValid}
            isLoading={this.props.isLoading}
          >
            Next
          </Button>
        </form>
      </div>
    );
  }
}
