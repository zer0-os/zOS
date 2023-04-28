import React from 'react';
import classNames from 'classnames';
import { connectContainer } from '../../store/redux-container';
import { setWalletModalOpen } from '../../store/web3';
import { Button as ZUIButton } from '@zero-tech/zui/components';

import './styles.scss';

export interface Properties {
  setWalletModalOpen: (status: boolean) => void;
  className?: string;
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

  openModal = () => {
    this.props.setWalletModalOpen(true);
  };

  render() {
    return (
      <ZUIButton
        onPress={this.openModal}
        className={classNames(this.props.className, 'authentication__connect-wrapper')}
      >
        Connect
      </ZUIButton>
    );
  }
}

export const Button = connectContainer<{ className?: string }>(Container);
