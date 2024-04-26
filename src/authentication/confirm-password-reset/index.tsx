import * as React from 'react';

import { Link } from 'react-router-dom';
import { Button, Alert, PasswordInput } from '@zero-tech/zui/components';

import { bem, bemClassName } from '../../lib/bem';
import { passwordRulesDescription, isPasswordValid } from '../../lib/password';
import { ConfirmPasswordResetStage } from '../../store/confirm-password-reset';

import './styles.scss';

const c = bem('confirm-password-reset');
const cn = bemClassName('confirm-password-reset');

export interface Properties {
  stage: ConfirmPasswordResetStage;
  isLoading: boolean;
  errors: {
    password?: string | string[];
    general?: string;
  };
  token: string;
  onSubmit: (data: { token: string; password: string }) => void;
}

interface State {
  password: string;
  confirmPassword: string;
  isPasswordInputFocused: boolean;
}

export class ConfirmPasswordReset extends React.Component<Properties, State> {
  state = {
    password: '',
    confirmPassword: '',
    isPasswordInputFocused: false,
  };

  handleConfirmPasswordReset = (e) => {
    e.preventDefault();
    this.props.onSubmit({ token: this.props.token, password: this.state.password });
  };

  trackPassword = (value) => this.setState({ password: value });
  trackConfirmPassword = (value) => this.setState({ confirmPassword: value });

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

  get isSubmitDisabled() {
    return (
      this.props.isLoading || this.state.password !== this.state.confirmPassword || this.state.password.length === 0
    );
  }

  handleFocus = () => {
    this.setState({ isPasswordInputFocused: true });
  };

  handleBlur = () => {
    this.setState({ isPasswordInputFocused: false });
  };

  renderSuccessMessage() {
    return (
      <div {...cn('success-message')}>
        <span>Password reset successful.</span>
        <span>
          You can now <Link to='/login'>Log in</Link> with your new password.
        </span>
      </div>
    );
  }

  renderForm() {
    return (
      <form {...cn('form')} onSubmit={this.handleConfirmPasswordReset}>
        <div {...cn('input-container')}>
          <PasswordInput
            {...cn('input')}
            alertClassName={c('input-alert')}
            label='New Password'
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
            label='Confirm New Password'
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
            <Alert isFilled {...cn('error')} variant='error'>
              {this.generalError}
            </Alert>
          </div>
        )}

        <Button {...cn('submit-button')} isLoading={this.props.isLoading} isSubmit isDisabled={this.isSubmitDisabled}>
          Reset Password
        </Button>
      </form>
    );
  }

  render() {
    const { stage } = this.props;

    return (
      <>
        <div {...cn('')}>
          <div {...cn('heading-container')}>
            <h3 {...cn('heading')}>Reset Password</h3>
            {stage === ConfirmPasswordResetStage.Done && this.renderSuccessMessage()}

            {stage === ConfirmPasswordResetStage.SubmitNewPassword && (
              <div {...cn('sub-heading')}>Enter a new password</div>
            )}
          </div>
          {stage === ConfirmPasswordResetStage.SubmitNewPassword && this.renderForm()}
        </div>
      </>
    );
  }
}
