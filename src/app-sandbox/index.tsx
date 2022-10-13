import React from 'react';
import { RootState } from '../store';
import { Store } from 'redux';

import { Apps } from '../lib/apps';
import { App as FeedApp } from '@zer0-os/zos-feed';
import { NFTsZApp } from '@zero-tech/zapp-nfts';
import { StakingZApp } from '@zero-tech/zapp-staking';
import { DaosApp } from '@zero-tech/zapp-daos';
import { BuyDomainsZApp } from '@zero-tech/zapp-buy-domains';
import { Chains } from '../lib/web3';
import { ethers } from 'ethers';
import { Channels } from '../platform-apps/channels';
import { PlatformUser } from './container';

import { AppLayout } from '../store/layout';
import { AppLayoutContextProvider } from '@zer0-os/zos-component-library';

import './styles.scss';

export interface AppInterface {
  provider: ethers.providers.Web3Provider;
  route: string;
  web3: {
    chainId: Chains;
    address: string;
    connectWallet;
  };
}

export interface Properties {
  web3Provider: ethers.providers.Web3Provider;
  store: Store<RootState>;
  user?: PlatformUser;
  znsRoute: string;
  address: string;
  chainId: Chains;
  selectedApp: Apps;
  connectWallet: () => void;
  layout: AppLayout;
  onUpdateLayout: (layout: Partial<AppLayout>) => void;
}

export class AppSandbox extends React.Component<Properties> {
  get layoutContext() {
    return {
      setHasContextPanel: this.handleSetHasContextPanel,
      setIsContextPanelOpen: this.handleSetIsContextPanelOpen,
      ...this.props.layout,
    };
  }

  get appProperties() {
    const { znsRoute, web3Provider, address, chainId, user, connectWallet } = this.props;

    return {
      route: znsRoute,
      provider: web3Provider,
      user,
      web3: {
        address,
        chainId,
        connectWallet,
      },
    };
  }

  handleSetHasContextPanel = (hasContextPanel: boolean) => this.props.onUpdateLayout({ hasContextPanel });
  handleSetIsContextPanelOpen = (isContextPanelOpen: boolean) => this.props.onUpdateLayout({ isContextPanelOpen });

  renderSelectedApp() {
    const { selectedApp, store } = this.props;

    if (selectedApp === Apps.Feed) {
      return <FeedApp {...this.appProperties} />;
    }

    if (selectedApp === Apps.Staking) {
      return <StakingZApp {...this.appProperties} />;
    }

    if (selectedApp === Apps.BuyDomains) {
      return <BuyDomainsZApp {...this.appProperties} />;
    }

    if (selectedApp === Apps.NFTS) {
      return <NFTsZApp {...this.appProperties} />;
    }

    if (selectedApp === Apps.Channels) {
      return (
        <Channels
          {...this.appProperties}
          store={store}
        />
      );
    }

    if (selectedApp === Apps.DAOS) {
      return <DaosApp {...this.appProperties} />;
    }

    return <div className='app-sandbox__error'>Error {selectedApp} application has not been implemented.</div>;
  }

  render() {
    return (
      <div className='app-sandbox'>
        <AppLayoutContextProvider value={this.layoutContext}>{this.renderSelectedApp()}</AppLayoutContextProvider>
      </div>
    );
  }
}
