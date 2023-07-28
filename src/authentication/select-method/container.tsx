import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { SelectMethod } from '.';
import { CreateEmailAccountContainer } from '../create-email-account/container';
import { CreateWalletAccountContainer } from '../create-wallet-account/container';
import { RegistrationStage, registerWithEmail, registerWithWallet } from '../../store/registration';

export interface PublicProperties {
  stage: RegistrationStage;
}

export interface Properties extends PublicProperties {
  registerWithEmail: () => void;
  registerWithWallet: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(_state: RootState) {
    return {};
  }

  static mapActions() {
    return { registerWithEmail, registerWithWallet };
  }

  renderCreateMethod = () => {
    switch (this.props.stage) {
      case RegistrationStage.EmailAccountCreation:
        return <CreateEmailAccountContainer />;
      case RegistrationStage.WalletAccountCreation:
        return <CreateWalletAccountContainer />;
      default:
        return null;
    }
  };

  render() {
    return (
      <>
        <SelectMethod onEmailSelected={this.props.registerWithEmail} onWalletSelected={this.props.registerWithWallet} />
        {this.renderCreateMethod()}
      </>
    );
  }
}

export const SelectMethodContainer = connectContainer<PublicProperties>(Container);
