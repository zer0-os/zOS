import * as React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { EmailLoginErrors, loginByEmail } from '../../store/login';

import { EmailLogin } from '.';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  errors: {
    email?: string;
    password?: string | string[];
    general?: string;
  };
  loginByEmail: (data: { email: string; password: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const { login } = state;
    return {
      isLoading: login.loading,
      errors: Container.mapErrors(login.errors),
    };
  }

  static mapErrors(errors: string[]) {
    const errorObject = {} as Properties['errors'];
    errors.forEach((error) => {
      switch (error) {
        case EmailLoginErrors.EMAIL_REQUIRED:
          errorObject.email = 'Email is required';
          break;
        case EmailLoginErrors.PASSWORD_REQUIRED:
          errorObject.password = 'Password is required';
          break;
        case EmailLoginErrors.PROFILE_NOT_EXISTS:
          errorObject.general = 'Email or Password incorrect';
          break;
        case EmailLoginErrors.INVALID_EMAIL_PASSWORD:
          errorObject.general = 'Email or Password incorrect';
          break;
        default:
          errorObject.general = 'An error has occurred';
          break;
      }
    });

    return errorObject;
  }

  static mapActions() {
    return { loginByEmail };
  }

  render() {
    return (
      <EmailLogin isLoading={this.props.isLoading} onSubmit={this.props.loginByEmail} errors={this.props.errors} />
    );
  }
}

export const EmailLoginContainer = connectContainer<PublicProperties>(Container);
