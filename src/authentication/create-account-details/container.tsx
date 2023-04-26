import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { CreateAccountDetails } from '.';
import { ProfileDetailsErrors } from '../../store/registration';
import { updateProfile } from '../../store/registration';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  errors: {
    name?: string;
    general?: string;
  };
  updateProfile: (data: { name: string }) => void;
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
        case ProfileDetailsErrors.NAME_REQUIRED:
          errorObject.name = 'Name is required';
          break;
        default:
          errorObject.general = 'An error has occurred';
          break;
      }
    });

    return errorObject;
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { updateProfile };
  }

  render() {
    return (
      <CreateAccountDetails
        isLoading={this.props.isLoading}
        onCreate={this.props.updateProfile}
        errors={this.props.errors}
      />
    );
  }
}

export const CreateAccountDetailsContainer = connectContainer<PublicProperties>(Container);
