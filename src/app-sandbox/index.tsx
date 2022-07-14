import React from 'react';
import { RootState } from '../store';
import { Store } from 'redux';

import { Apps } from '../lib/apps';
import { App as FeedApp } from '@zer0-os/zos-feed';
import { Chains } from '../lib/web3';
import { ethers } from 'ethers';
import { Channels } from '../platform-apps/channels';
import { PlatformUser } from './container';

import './styles.scss';

export interface AppInterface {
  provider: ethers.providers.Web3Provider;
  route: string;
  web3: {
    chainId: Chains;
    address: string;
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
}

export class AppSandbox extends React.Component<Properties> {
  get appProperties() {
    const { znsRoute, web3Provider, address, chainId, user } = this.props;

    return {
      route: znsRoute,
      provider: web3Provider,
      user,
      web3: {
        address,
        chainId,
      },
    };
  }

  renderSelectedApp() {
    const { selectedApp, store } = this.props;

    if (selectedApp === Apps.Feed) {
      return <FeedApp {...this.appProperties} />;
    }

    if (selectedApp === Apps.Channels) {
      return (
        <Channels
          {...this.appProperties}
          store={store}
        />
      );
    }

    return <div className='app-sandbox__error'>Error {selectedApp} application has not been implemented.</div>;
  }

  render() {
    return <div className='app-sandbox'>{this.renderSelectedApp()}</div>;
  }
}
