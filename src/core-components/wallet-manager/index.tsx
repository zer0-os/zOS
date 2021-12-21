import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { Button } from '../../shared-components/button';

import './styles.css';
import {WalletSelectModal} from '../../shared-components/wallet-select/modal';

export interface Properties {
}

export interface State {
  showModal: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(_state: RootState): Partial<Properties> {
    return {
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  state = { showModal: false };

  get showModal() {
    return this.state.showModal;
  }

  openModal = () => this.setState({ showModal: true });
  closeModal = () => this.setState({ showModal: false });

  render() {
    return (
      <div className="wallet-manager">
        <Button className='wallet-manager__connect-button' onClick={this.openModal} />
        {this.showModal && <WalletSelectModal onClose={this.closeModal} />}
      </div>
    );
  }
}

export const WalletManager = connectContainer<{}>(Container);
