import * as React from 'react';

import { Footer } from '../footer/footer';
import { Button, Input, Alert } from '@zero-tech/zui/components';

import { bem, bemClassName } from '../../lib/bem';
import { RequestPasswordResetStage } from '../../store/request-password-reset';

import './styles.scss';

const c = bem('request-password-reset');
const cn = bemClassName('request-password-reset');

export interface Properties {
  stage: RequestPasswordResetStage;
  isLoading: boolean;
  errors: {
    email?: string;
    general?: string;
  };

  onSubmit: (data: { email: string }) => void;
}

interface State {
  email: string;
}

export class RequestPasswordReset extends React.Component<Properties, State> {
  state = {
    email: '',
  };

  handleRequestPasswordReset = (e) => {
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
      <form {...cn('form')} onSubmit={this.handleRequestPasswordReset}>
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
            <Alert {...cn('error')} variant='error' isFilled>
              {this.generalError}
            </Alert>
          </div>
        )}

        <Button
          {...cn('submit-button', !this.generalError && 'no-error')}
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
    const { stage } = this.props;
    const isResetPasswordDone = stage === RequestPasswordResetStage.Done;

    return (
      <>
        <div {...cn('')}>
          <div {...cn('heading-container')}>
            <h3 {...cn('heading')}>Reset Password</h3>
            {isResetPasswordDone && this.renderSuccessMessage()}

            {!isResetPasswordDone && (
              <div {...cn('sub-heading')}>Enter your ZERO account email and we’ll send a reset link</div>
            )}
          </div>

          {!isResetPasswordDone && this.renderForm()}
        </div>
        <Footer stage={this.props.stage} />
      </>
    );
  }
}
