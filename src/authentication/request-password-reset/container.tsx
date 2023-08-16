import * as React from 'react';

import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import {
  RequestPasswordResetErrors,
  RequestPasswordResetStage,
  requestPasswordReset,
} from '../../store/request-password-reset';
import { RequestPasswordReset as RequestPasswordResetComponent } from '.';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  stage: RequestPasswordResetStage;
  isLoading: boolean;
  errors: {
    email?: string;
    general?: string;
  };

  requestPasswordReset: (data: { email: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const { requestPasswordReset } = state;

    return {
      stage: requestPasswordReset.stage,
      isLoading: requestPasswordReset.loading,
      errors: Container.mapErrors(requestPasswordReset.errors),
    };
  }

  static mapErrors(errors: string[]) {
    const errorObject = {} as Properties['errors'];

    errors.forEach((error) => {
      switch (error) {
        case RequestPasswordResetErrors.EMAIL_REQUIRED:
          errorObject.email = 'Email is required';
          break;
        case RequestPasswordResetErrors.UNKNOWN_ERROR:
          errorObject.email = 'Something went wrong. Please try again.';
          break;
        default:
          errorObject.general = 'Something went wrong. Please try again.';
          break;
      }
    });
    return errorObject;
  }

  static mapActions(_props: Properties) {
    return { requestPasswordReset };
  }

  render() {
    return (
      <RequestPasswordResetComponent
        stage={this.props.stage}
        isLoading={this.props.isLoading}
        onSubmit={this.props.requestPasswordReset}
        errors={this.props.errors}
      />
    );
  }
}

export const RequestPasswordResetContainer = connectContainer<PublicProperties>(Container);
