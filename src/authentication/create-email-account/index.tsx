import * as React from 'react';

import { passwordRulesDescription, isPasswordValid } from '../../lib/password';
import { Alert, Button, Input, PasswordInput } from '@zero-tech/zui/components';

import { bem, bemClassName } from '../../lib/bem';
import './styles.scss';

const cn = bemClassName('create-email-account');
const c = bem('create-email-account');

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
}

export class CreateEmailAccount extends React.Component<Properties, State> {
  state = {
    email: '',
    password: '',
    confirmPassword: '',
    isPasswordInputFocused: false,
  };

  publishOnNext = (e) => {
    e.preventDefault();
    this.props.onNext({ email: this.state.email, password: this.state.password });
  };

  trackEmail = (value) => this.setState({ email: value });
  trackPassword = (value) => this.setState({ password: value });

  trackConfirmPassword = (value) => this.setState({ confirmPassword: value });

  get emailError() {
    if (this.props.errors.email) {
      return { variant: 'error', text: this.props.errors.email } as any;
    }
    return null;
  }

  get passwordAlert() {
    if (isPasswordValid(this.state.password)) {
      return { variant: 'success', text: passwordRulesDescription() } as any;
    }

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
      return { variant: 'success', text: 'Passwords match' } as any;
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
          <div {...cn('input-container')}>
            <Input
              {...cn('input')}
              alertClassName={c('input-alert')}
              label='Email Address'
              name='email'
              value={this.state.email}
              onChange={this.trackEmail}
              error={!!this.emailError}
              alert={this.emailError}
            />
            <PasswordInput
              {...cn('input')}
              alertClassName={c('input-alert')}
              label='Password'
              name='password'
              value={this.state.password}
              onChange={this.trackPassword}
              error={this.passwordAlert?.variant === 'error' || false}
              alert={this.passwordAlert}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              size='large'
            />
            <PasswordInput
              {...cn('input')}
              alertClassName={c('input-alert')}
              label='Confirm Password'
              name='confirmPassword'
              value={this.state.confirmPassword}
              onChange={this.trackConfirmPassword}
              error={this.confirmPasswordAlert?.variant === 'error' || false}
              alert={this.confirmPasswordAlert}
              size='large'
            />
          </div>
          {this.generalError && (
            <div {...cn('error-container')}>
              <Alert {...cn('error')} variant='error' isFilled>
                {this.generalError}
              </Alert>
            </div>
          )}

          <Button {...cn('submit-button')} isLoading={this.props.isLoading} isSubmit isDisabled={this.isNextDisabled}>
            Next
          </Button>
        </form>
      </div>
    );
  }
}
