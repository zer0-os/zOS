import React from 'react';

import { connectContainer } from '../../store/redux-container';
import { setWalletModalOpen } from '../../store/web3';
import { Button as ConnectButton } from './button';

export interface Properties {
  setWalletModalOpen: (status: boolean) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(_state) {
    return {};
  }

  static mapActions(_props): Partial<Properties> {
    return {
      setWalletModalOpen,
    };
  }

  render() {
    return <ConnectButton setWalletModalOpen={this.props.setWalletModalOpen} />;
  }
}

export const Button = connectContainer<{}>(Container);
