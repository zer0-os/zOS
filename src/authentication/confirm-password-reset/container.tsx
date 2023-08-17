import * as React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { passwordRulesDescription } from '../../lib/password';
import { ConfirmPasswordReset as ConfirmPasswordResetComponent } from '.';
import {
  ConfirmPasswordResetErrors,
  ConfirmPasswordResetStage,
  enterConfirmPasswordResetPage,
  leaveConfirmPasswordResetPage,
  updatePassword,
} from '../../store/confirm-password-reset';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  stage: ConfirmPasswordResetStage;
  isLoading: boolean;
  errors: {
    password?: string | string[];
    general?: string;
  };

  updatePassword: (data: { password: string }) => void;
  enterConfirmPasswordResetPage: () => void;
  leaveConfirmPasswordResetPage: () => void;
}

export class Container extends React.Component<Properties> {
  componentDidMount() {
    this.props.enterConfirmPasswordResetPage();
  }

  componentWillUnmount() {
    this.props.leaveConfirmPasswordResetPage();
  }

  static mapState(state: RootState) {
    const { confirmPasswordReset } = state;

    return {
      stage: confirmPasswordReset.stage,
      isLoading: confirmPasswordReset.loading,
      errors: Container.mapErrors(confirmPasswordReset.errors),
    };
  }

  static mapErrors(errors: string[]) {
    const errorObject = {} as Properties['errors'];

    errors.forEach((error) => {
      switch (error) {
        case ConfirmPasswordResetErrors.PASSWORD_REQUIRED:
          errorObject.password = 'Password is required';
          break;
        case ConfirmPasswordResetErrors.PASSWORD_TOO_WEAK:
          errorObject.password = passwordRulesDescription();
          break;
        case ConfirmPasswordResetErrors.PASSWORD_INVALID:
          errorObject.password = passwordRulesDescription();
          break;
        default:
          errorObject.general = 'An error has occurred';
          break;
      }
    });

    return errorObject;
  }

  static mapActions(_props: Properties) {
    return { updatePassword, enterConfirmPasswordResetPage, leaveConfirmPasswordResetPage };
  }

  render() {
    return (
      <ConfirmPasswordResetComponent
        stage={this.props.stage}
        isLoading={this.props.isLoading}
        onSubmit={this.props.updatePassword}
        errors={this.props.errors}
      />
    );
  }
}

export const ConfirmPasswordResetContainer = connectContainer<PublicProperties>(Container);
