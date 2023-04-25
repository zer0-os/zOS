import * as React from 'react';

import { Alert, Button, Input, PasswordInput } from '@zero-tech/zui/components';

import './styles.scss';
import { bem } from '../../lib/bem';
const c = bem('create-email-account');

export interface Properties {
  isLoading: boolean;
  errors: {
    email?: string;
    password?: string;
    general?: string;
  };

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

  get emailError() {
    if (this.props.errors.email) {
      return { variant: 'error', text: this.props.errors.email } as any;
    }
    return null;
  }

  get passwordError() {
    if (this.props.errors.password) {
      return { variant: 'error', text: this.props.errors.password } as any;
    }
    return null;
  }

  get generalError() {
    return this.props.errors.general;
  }

  render() {
    return (
      <div className={c('')}>
        <h3 className={c('heading')}>CREATE YOUR ACCOUNT</h3>
        <div className={c('sub-heading')}>Step 1 of 2: Enter your details</div>
        <form className={c('form')}>
          <Input
            label='Email Address'
            name='email'
            value={this.state.email}
            onChange={this.trackEmail}
            error={!!this.emailError}
            alert={this.emailError}
          />
          <PasswordInput
            label='Password'
            name='password'
            value={this.state.password}
            onChange={this.trackPassword}
            error={!!this.passwordError}
            alert={this.passwordError}
          />
          {this.generalError && <Alert variant='error'>{this.generalError}</Alert>}

          <Button className={c('button')} onPress={this.publishOnNext} isLoading={this.props.isLoading}>
            Next
          </Button>
        </form>
      </div>
    );
  }
}
