import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { CreateEmailAccount } from '.';
import { AccountCreationErrors, createAccount } from '../../store/registration';
import { addEmailAccount } from '../../store/account-management';
import { passwordRulesDescription } from '../../lib/password';

export interface PublicProperties {
  addAccount?: boolean;
}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  errors: {
    email?: string;
    password?: string | string[];
    general?: string;
  };
  createAccount: (data: { email: string; password: string }) => void;
  addEmailAccount: (data: { email: string; password: string }) => void;
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
        case AccountCreationErrors.PROFILE_PRIMARY_EMAIL_REQUIRED:
          errorObject.email = 'Email is required';
          break;
        case AccountCreationErrors.EMAIL_INVALID:
          errorObject.email = 'Please enter a valid email address';
          break;
        case AccountCreationErrors.EMAIL_ALREADY_EXISTS:
          errorObject.email = 'This email is already associated with a ZERO account';
          break;
        case AccountCreationErrors.PROFILE_PRIMARY_EMAIL_ALREADY_EXISTS:
          errorObject.email = 'This email is already associated with a ZERO account';
          break;
        case AccountCreationErrors.PASSWORD_REQUIRED:
          errorObject.password = 'Password is required';
          break;
        case AccountCreationErrors.PASSWORD_TOO_WEAK:
          errorObject.password = passwordRulesDescription();
          break;
        case AccountCreationErrors.PASSWORD_INVALID:
          errorObject.password = passwordRulesDescription();
          break;
        default:
          errorObject.general = 'An error has occurred';
          break;
      }
    });

    return errorObject;
  }

  static mapActions() {
    return { createAccount, addEmailAccount };
  }

  addOrCreateAccount = async (data) => {
    if (this.props.addAccount) {
      this.props.addEmailAccount(data);
    } else {
      this.props.createAccount(data);
    }
  };

  render() {
    return (
      <CreateEmailAccount
        isLoading={this.props.isLoading}
        onNext={this.addOrCreateAccount}
        errors={this.props.errors}
      />
    );
  }
}

export const CreateEmailAccountContainer = connectContainer<PublicProperties>(Container);
