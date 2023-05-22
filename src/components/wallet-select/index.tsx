import React from 'react';
import classNames from 'classnames';

import { wallets, WalletType } from './wallets';
import { Button } from '@zero-tech/zui/components';

import './styles.scss';
import { bem } from '../../lib/bem';
import { IconLinkExternal1 } from '@zero-tech/zui/icons';
// Temporarily use different base class name to avoid conflicts with zos-component-library
const c = bem('zos-wallet-select');

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
        <div className={c('connecting-indicator')}>
          <Button isDisabled={true}>Connecting...</Button>
        </div>
      );
    }

    return <ul>{this.renderWallets()}</ul>;
  }

  renderWallets() {
    return this.wallets.map((walletType) => {
      const { type, name, imageSource } = wallets[walletType];

      return (
        <li key={type} className={c('wallet-provider')} onClick={this.getClickHandler(type)}>
          <span className={c('wallet-name')}>{name}</span>
          <div>
            <div className={c('wallet-provider-logo')}>
              <img src={imageSource} alt={name} />
            </div>
          </div>
        </li>
      );
    });
  }

  render() {
    return (
      <div className={classNames(c(''), this.props.className)}>
        <div className={c('title-bar')}>
          <h3 className={c('title')}>Connect To A Wallet</h3>
        </div>
        {this.renderContent()}
        <div className={c('footer')}>
          New to Ethereum?
          <div className={c('footer-link')}>
            <a href='https://ethereum.org/en/wallets/' target='_blank' rel='noreferrer'>
              Learn more about wallets <IconLinkExternal1 className={c('external-icon')} size={12} />
            </a>
          </div>
        </div>
      </div>
    );
  }
}
