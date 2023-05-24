import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { SelectMethod } from '.';
import { registerWithEmail, registerWithWallet } from '../../store/registration';

export interface PublicProperties {}

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

  render() {
    return (
      <SelectMethod onEmailSelected={this.props.registerWithEmail} onWalletSelected={this.props.registerWithWallet} />
    );
  }
}

export const SelectMethodContainer = connectContainer<PublicProperties>(Container);
