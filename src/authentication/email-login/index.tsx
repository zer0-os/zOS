import * as React from 'react';

import { Alert, Button, Input, PasswordInput } from '@zero-tech/zui/components';

import { bem, bemClassName } from '../../lib/bem';

import './styles.scss';

const c = bem('email-login');
const cn = bemClassName('email-login');

export interface Properties {
  isLoading: boolean;
  errors: {
    email?: string;
    password?: string | string[];
    general?: string;
  };

  onSubmit: (data: { email: string; password: string }) => void;
}

interface State {
  email: string;
  password: string;
}

export class EmailLogin extends React.Component<Properties, State> {
  state = { email: '', password: '' };

  trackEmail = (value) => this.setState({ email: value });
  trackPassword = (value) => this.setState({ password: value });

  publishOnSubmit = (e) => {
    e.preventDefault();
    this.props.onSubmit({ email: this.state.email, password: this.state.password });
  };

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
    return { variant: 'error', text: this.props.errors.password } as any;
  }

  get generalError() {
    return this.props.errors.general;
  }

  render() {
    return (
      <div {...cn('')}>
        <form {...cn('form')} onSubmit={this.publishOnSubmit}>
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
              error={!!this.passwordError}
              alert={this.passwordError}
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
          <Button {...cn('submit-button')} isLoading={this.props.isLoading} isSubmit>
            Log in
          </Button>
        </form>
      </div>
    );
  }
}
