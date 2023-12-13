import React from 'react';
import { RootState } from '../store/reducer';
import { Store } from 'redux';

import { Apps } from '../lib/apps';
import { Chains } from '../lib/web3';
import { ethers } from 'ethers';
import { PlatformUser } from './container';

import { AppLayout } from '../store/layout';
import { AuthenticationContext } from '../components/authentication/context';

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
  authenticationContext: AuthenticationContext;
  layout: AppLayout;
  onUpdateLayout: (layout: Partial<AppLayout>) => void;
}

export class AppSandbox extends React.Component<Properties> {
  get layoutContext() {
    return {};
  }

  render() {
    return null;
  }
}
