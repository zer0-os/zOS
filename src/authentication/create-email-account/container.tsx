import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { CreateEmailAccount } from '.';
import { createAccount } from '../../store/registration';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  createAccount: (data: { email: string; password: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const { registration } = state;
    return {
      isLoading: registration.loading,
    };
  }

  static mapActions() {
    return { createAccount };
  }

  render() {
    return <CreateEmailAccount isLoading={this.props.isLoading} onNext={this.props.createAccount} />;
  }
}

export const CreateEmailAccountContainer = connectContainer<PublicProperties>(Container);
