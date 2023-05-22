import React from 'react';
import classNames from 'classnames';

import { wallets, WalletType } from './wallets';
import { Button } from '@zero-tech/zui/components';

export interface Properties {
  isConnecting: boolean;
  className?: string;
  wallets?: WalletType[];

  onSelect?: (connector: WalletType) => void;
}

export class WalletSelect extends React.Component<Properties> {
  private clickHandlers: any = {};

  getClickHandler = (walletType: WalletType) => {
    if (!this.clickHandlers[walletType]) {
      this.clickHandlers[walletType] = () => this.props.onSelect(walletType);
    }

    return this.clickHandlers[walletType];
  };

  get wallets() {
    return this.props.wallets || Object.values(WalletType);
  }

  renderContent() {
    if (this.props.isConnecting) {
      return (
        <div className='wallet-select__connecting-indicator'>
          <Button>Connecting...</Button>
        </div>
      );
    }

    return <ul>{this.renderWallets()}</ul>;
  }

  renderWallets() {
    return this.wallets.map((walletType) => {
      const { type, name, imageSource } = wallets[walletType];

      return (
        <li key={type} className='wallet-select__wallet-provider' onClick={this.getClickHandler(type)}>
          <span className='wallet-select__wallet-name'>{name}</span>
          <div>
            <div className='wallet-select__wallet-provider-logo'>
              <img src={imageSource} alt={name} />
            </div>
          </div>
        </li>
      );
    });
  }

  render() {
    return (
      <div className={classNames('wallet-select', 'border-primary', this.props.className)}>
        <div className='wallet-select__header'>
          <h3 className='glow-text'>Connect To A Wallet</h3>
        </div>
        <hr className='glow' />
        {this.renderContent()}
        <hr className='glow' />
        <div className='wallet-select__footer'>
          New to Ethereum?
          <br />
          <a href='https://ethereum.org/en/wallets/' target='_blank' rel='noreferrer'>
            Learn more about wallets
          </a>
        </div>
      </div>
    );
  }
}
