import * as React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { ResetPasswordErrors, resetPassword } from '../../store/reset-password';
import { ResetPassword as ResetPasswordComponent } from '.';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  errors: {
    email?: string;
    general?: string;
  };
  emailSubmitted: boolean;

  resetPassword: (data: { email: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const { resetPassword } = state;

    return {
      isLoading: resetPassword.loading,
      emailSubmitted: resetPassword.emailSubmitted,
      errors: Container.mapErrors(resetPassword.errors),
    };
  }

  static mapErrors(errors: string[]) {
    const errorObject = {} as Properties['errors'];

    errors.forEach((error) => {
      switch (error) {
        case ResetPasswordErrors.EMAIL_INVALID:
          errorObject.email = 'Please enter a valid email address';
          break;
        case ResetPasswordErrors.EMAIL_REQUIRED:
          errorObject.email = 'Email is required';
          break;
        default:
          errorObject.general = 'An error has occurred';
          break;
      }
    });
    return errorObject;
  }

  static mapActions(_props: Properties) {
    return { resetPassword };
  }

  render() {
    return (
      <ResetPasswordComponent
        isLoading={this.props.isLoading}
        onSubmit={this.props.resetPassword}
        errors={this.props.errors}
        emailSubmitted={this.props.emailSubmitted}
      />
    );
  }
}

export const ResetPasswordContainer = connectContainer<PublicProperties>(Container);
