import * as React from 'react';

import { Strength, passwordRulesDescription, passwordStrength } from '../../lib/password';
import { Alert, Button, Input, PasswordInput } from '@zero-tech/zui/components';

import { bemClassName } from '../../lib/bem';
import './styles.scss';

const cn = bemClassName('create-email-account');

export interface Properties {
  isLoading: boolean;
  errors: {
    email?: string;
    password?: string | string[];
    general?: string;
  };

  onNext: (data: { email: string; password: string }) => void;
}

interface State {
  email: string;
  password: string;
  confirmPassword: string;
  isPasswordInputFocused: boolean;
  strength: Strength;
}

export class CreateEmailAccount extends React.Component<Properties, State> {
  state = {
    email: '',
    password: '',
    confirmPassword: '',
    isPasswordInputFocused: false,
    strength: 0,
  };

  publishOnNext = (e) => {
    e.preventDefault();
    this.props.onNext({ email: this.state.email, password: this.state.password });
  };

  trackEmail = (value) => this.setState({ email: value });
  trackPassword = (value) => {
    const strength = passwordStrength(value);
    this.setState({ password: value, strength });
  };

  trackConfirmPassword = (value) => this.setState({ confirmPassword: value });

  get emailError() {
    if (this.props.errors.email) {
      return { variant: 'error', text: this.props.errors.email } as any;
    }
    return null;
  }

  get passwordAlert() {
    if (this.props.errors.password) {
      return { variant: 'error', text: this.props.errors.password } as any;
    }

    if (this.state.isPasswordInputFocused) {
      return { variant: 'info', text: passwordRulesDescription() } as any;
    }

    return null;
  }

  get confirmPasswordAlert() {
    if (this.state.confirmPassword.trim().length === 0) {
      return null;
    }

    if (this.state.password === this.state.confirmPassword) {
      return { variant: 'success', text: 'Passwords match' };
    }

    return { variant: 'error', text: 'Passwords do not match' } as any;
  }

  get generalError() {
    return this.props.errors.general;
  }

  get isNextDisabled() {
    return (
      this.props.isLoading ||
      this.state.password !== this.state.confirmPassword ||
      this.state.password.length === 0 ||
      this.state.email.length === 0
    );
  }

  handleFocus = () => {
    this.setState({ isPasswordInputFocused: true });
  };

  handleBlur = () => {
    this.setState({ isPasswordInputFocused: false });
  };

  render() {
    return (
      <div {...cn('')}>
        <form {...cn('form')} onSubmit={this.publishOnNext}>
          <Input
            {...cn('input')}
            label='Email Address'
            name='email'
            value={this.state.email}
            onChange={this.trackEmail}
            error={!!this.emailError}
            alert={this.emailError}
          />
          <PasswordInput
            {...cn('input')}
            label='Password'
            name='password'
            value={this.state.password}
            onChange={this.trackPassword}
            error={this.passwordAlert?.variant === 'error' || false}
            alert={this.passwordAlert}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
          />
          <PasswordInput
            {...cn('input')}
            label='Confirm Password'
            name='confirm password'
            value={this.state.confirmPassword}
            onChange={this.trackConfirmPassword}
            error={this.confirmPasswordAlert?.variant === 'error' || false}
            success={this.confirmPasswordAlert?.variant === 'success' || false}
            alert={this.confirmPasswordAlert}
          />

          {this.generalError && <Alert variant='error'>{this.generalError}</Alert>}

          <Button isLoading={this.props.isLoading} isSubmit isDisabled={this.isNextDisabled}>
            Next
          </Button>
        </form>
      </div>
    );
  }
}
