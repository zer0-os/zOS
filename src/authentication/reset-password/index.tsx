import * as React from 'react';

import { Button, Input, Alert } from '@zero-tech/zui/components';

import classNames from 'classnames';
import { bem, bemClassName } from '../../lib/bem';

import './styles.scss';

const c = bem('reset-password');
const cn = bemClassName('reset-password');

export interface Properties {
  isLoading: boolean;
  emailSubmitted: boolean; // <- Add this property
  errors: {
    email?: string;
    general?: string;
  };

  onSubmit: (data: { email: string }) => void;
}

interface State {
  email: string;
}

export class ResetPassword extends React.Component<Properties, State> {
  state = {
    email: '',
  };

  handleResetPassword = (e) => {
    e.preventDefault();
    this.props.onSubmit({ email: this.state.email });
  };

  trackEmail = (value) => this.setState({ email: value });

  get emailError() {
    if (this.props.errors.email) {
      return { variant: 'error', text: this.props.errors.email } as any;
    }
    return null;
  }

  get generalError() {
    return this.props.errors.general;
  }

  get isSubmitDisabled() {
    return this.props.isLoading || this.state.email.length === 0;
  }

  renderSuccessMessage() {
    return (
      <div {...cn('success-message')}>
        An email containing a reset password link has been emailed to: {this.state.email}
      </div>
    );
  }

  renderForm() {
    return (
      <form {...cn('form')} onSubmit={this.handleResetPassword}>
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

        {this.generalError && (
          <div {...cn('error-container')}>
            <Alert {...cn('error')} variant='error'>
              {this.generalError}
            </Alert>
          </div>
        )}

        <Button
          className={classNames(c('submit-button', !this.generalError && 'no-error'))}
          variant='primary'
          isDisabled={this.isSubmitDisabled}
          isLoading={this.props.isLoading}
          isSubmit
        >
          Send reset email
        </Button>
      </form>
    );
  }

  render() {
    const { emailSubmitted } = this.props;

    return (
      <div {...cn('')}>
        <div {...cn('heading-container')}>
          <h3 {...cn('heading')}>Reset Password</h3>
          {emailSubmitted && this.renderSuccessMessage()}

          {!emailSubmitted && (
            <div {...cn('sub-heading')}>Enter your ZERO account email and we’ll send a reset link</div>
          )}
        </div>

        {!emailSubmitted && this.renderForm()}
      </div>
    );
  }
}
