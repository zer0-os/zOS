import React from 'react';

import { Action } from 'redux';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { RegistrationStage, registerWithEmail, registerWithWallet } from '../../store/registration';

import { CreateAccountMethod } from '.';

export interface CreateAccountMethodProps {
  stage: RegistrationStage;
  isConnecting: boolean;

  registerWithEmail: () => Action<string>;
  registerWithWallet: () => Action<string>;
}

export class Container extends React.Component<CreateAccountMethodProps> {
  static mapState(state: RootState): Partial<CreateAccountMethodProps> {
    const { registration } = state;
    return {
      stage: registration.stage,
      isConnecting: registration.loading,
    };
  }

  static mapActions(_props: CreateAccountMethodProps): Partial<CreateAccountMethodProps> {
    return { registerWithEmail: registerWithEmail, registerWithWallet: registerWithWallet };
  }

  handleSelectionChange = (selectedOption: string) => {
    if (selectedOption === 'web3') {
      this.props.registerWithWallet();
    } else if (selectedOption === 'email') {
      this.props.registerWithEmail();
    }
  };

  render() {
    return (
      <CreateAccountMethod
        stage={this.props.stage}
        isConnecting={this.props.isConnecting}
        onSelectionChange={this.handleSelectionChange}
      />
    );
  }
}

export const CreateAccountMethodContainer = connectContainer<{}>(Container);
