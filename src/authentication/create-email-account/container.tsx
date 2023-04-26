import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { CreateEmailAccount } from '.';
import { AccountCreationErrors, createAccount } from '../../store/registration';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  errors: {
    email?: string;
    password?: string;
    general?: string;
  };
  createAccount: (data: { email: string; password: string }) => void;
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
        case AccountCreationErrors.EMAIL_REQUIRED:
          errorObject.email = 'Email is required';
          break;
        case AccountCreationErrors.EMAIL_INVALID:
          errorObject.email = 'This email is invalid';
          break;
        case AccountCreationErrors.EMAIL_ALREADY_EXISTS:
          errorObject.email = 'This email already exists';
          break;
        case AccountCreationErrors.PASSWORD_REQUIRED:
          errorObject.password = 'Password is required';
          break;
        case AccountCreationErrors.PASSWORD_INVALID:
          errorObject.password = 'Password is too weak';
          break;
        default:
          errorObject.general = 'An error has occurred';
          break;
      }
    });

    return errorObject;
  }

  static mapActions() {
    return { createAccount };
  }

  render() {
    return (
      <CreateEmailAccount
        isLoading={this.props.isLoading}
        onNext={this.props.createAccount}
        errors={this.props.errors}
      />
    );
  }
}

export const CreateEmailAccountContainer = connectContainer<PublicProperties>(Container);
