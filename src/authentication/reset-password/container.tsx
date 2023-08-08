import * as React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { AccountCreationErrors, resetPassword } from '../../store/registration';
import { ResetPassword } from '.';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  errors: {
    email?: string;
    password?: string | string[];
    general?: string;
  };
  resetPassword: (data: { email: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const { registration } = state;

    return {
      isLoading: registration.loading,
      errors: Container.mapErrors(registration.errors),
    };
  }

  static mapErrors(errors: string[]) {
    const errorObject = {} as Properties['errors'];

    errors.forEach((error) => {
      switch (error) {
        case AccountCreationErrors.EMAIL_INVALID:
          errorObject.email = 'Please enter a valid email address';
          break;
        case AccountCreationErrors.EMAIL_ALREADY_EXISTS:
          errorObject.email = 'This email is already associated with a ZERO account';
          break;
        case AccountCreationErrors.PROFILE_PRIMARY_EMAIL_ALREADY_EXISTS:
          errorObject.email = 'This email is already associated with a ZERO account';
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
      <ResetPassword isLoading={this.props.isLoading} onSubmit={this.props.resetPassword} errors={this.props.errors} />
    );
  }
}

export const ResetPasswordContainer = connectContainer<PublicProperties>(Container);
