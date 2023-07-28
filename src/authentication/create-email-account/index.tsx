import * as React from 'react';

import { Alert, Button, Input, PasswordInput } from '@zero-tech/zui/components';

import './styles.scss';
import { bem } from '../../lib/bem';
import { PasswordStrength } from '../../components/password-strength';
import { Strength, passwordStrength } from '../../lib/password';

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
  strength: Strength;
}

function unorderedList(arr) {
  return (
    <ul className={c('error-list')}>
      {arr.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export class CreateEmailAccount extends React.Component<Properties, State> {
  state = { email: '', password: '', strength: 0 };

  publishOnNext = (e) => {
    e.preventDefault();
    this.props.onNext({ email: this.state.email, password: this.state.password });
  };

  trackEmail = (value) => this.setState({ email: value });
  trackPassword = (value) => {
    const strength = passwordStrength(value);
    this.setState({ password: value, strength });
  };

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
    if (!this.props.errors.password) {
      return null;
    }
    if (Array.isArray(this.props.errors.password)) {
      return { variant: 'error', text: unorderedList(this.props.errors.password) } as any;
    }
    return { variant: 'error', text: this.props.errors.password } as any;
  }

  get generalError() {
    return this.props.errors.general;
  }

  render() {
    return (
      <div className={c('')}>
        <form className={c('form')} onSubmit={this.publishOnNext}>
          <Input
            className={c('input')}
            label='Email Address'
            name='email'
            value={this.state.email}
            onChange={this.trackEmail}
            error={!!this.emailError}
            alert={this.emailError}
          />
          <PasswordInput
            className={c('input')}
            label='Password'
            name='password'
            value={this.state.password}
            onChange={this.trackPassword}
            error={!!this.passwordError}
            alert={this.passwordError}
          />
          <PasswordStrength strength={this.state.strength} />
          {this.generalError && <Alert variant='error'>{this.generalError}</Alert>}

          <Button isLoading={this.props.isLoading} isSubmit>
            Next
          </Button>
        </form>
      </div>
    );
  }
}
