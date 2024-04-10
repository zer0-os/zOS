import React from 'react';
import classNames from 'classnames';

import { wallets, WalletType } from './wallets';

import './styles.scss';
import { bemClassName } from '../../lib/bem';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconLinkExternal1 } from '@zero-tech/zui/icons';

const cn = bemClassName('zos-wallet-select');

export interface Properties {
  isConnecting: boolean;
  walletSelectTitle?: string;
  className?: string;
  wallets?: WalletType[];

  onSelect?: (connector: WalletType) => void;
}

export class WalletSelect extends React.Component<Properties> {
  state = {
    selectedWalletName: '',
  };

  private clickHandlers: any = {};

  getClickHandler = (walletType: WalletType) => {
    if (!this.clickHandlers[walletType]) {
      this.clickHandlers[walletType] = () => {
        this.props.onSelect(walletType);
        this.setState({ selectedWalletName: wallets[walletType].name });
      };
    }

    return this.clickHandlers[walletType];
  };

  get wallets() {
    return this.props.wallets || Object.values(WalletType);
  }

  renderContent() {
    if (this.props.isConnecting) {
      return (
        <div {...cn('connecting-indicator')}>
          <div {...cn('connecting-wallet-name')}>{this.state.selectedWalletName}</div>
          <Button isLoading={this.props.isConnecting} variant={ButtonVariant.Secondary}>
            {}
          </Button>
        </div>
      );
    }

    return <ul>{this.renderWallets()}</ul>;
  }

  renderWallets() {
    return this.wallets.map((walletType) => {
      const { type, name, imageSource } = wallets[walletType];

      return (
        <li key={type} {...cn('wallet-provider')} onClick={this.getClickHandler(type)}>
          <span {...cn('wallet-name')}>{name}</span>
          <div>
            <div {...cn('wallet-provider-logo')}>
              <img src={imageSource} alt={name} />
            </div>
          </div>
        </li>
      );
    });
  }

  render() {
    const baseClass = cn('');
    const combinedClassNames = classNames(baseClass.className, this.props.className);

    return (
      <div className={combinedClassNames}>
        {!this.props.isConnecting && this.props.walletSelectTitle && (
          <div {...cn('title-bar')}>
            <h3 {...cn('title')}>{this.props.walletSelectTitle}</h3>
          </div>
        )}
        {this.renderContent()}
        {!this.props.isConnecting && (
          <div {...cn('footer')}>
            New to Ethereum?
            <div {...cn('footer-link')}>
              <a href='https://ethereum.org/en/wallets/' target='_blank' rel='noreferrer'>
                Learn more about wallets <IconLinkExternal1 {...cn('external-icon')} size={12} />
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }
}
