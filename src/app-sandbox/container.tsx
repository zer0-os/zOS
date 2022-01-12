import React from 'react';
import { RootState } from './store';
import { connectContainer } from '../store/redux-container';
import { AppSandbox, Apps } from '.';
import { ConnectionStatus } from '../lib/web3';

export interface Properties {
  route: string;
  connectionStatus: ConnectionStatus;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      route: state.zns.value.route,
      connectionStatus: state.web3.status,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { };
  }

  get isConnected() {
    return this.props.connectionStatus === ConnectionStatus.Connected;
  }

  render() {
    if (!this.isConnected) return null;

    return (
      <AppSandbox selectedApp={Apps.Feed} znsRoute={this.props.route} />
    );
  }
}

export const AppSandboxContainer = connectContainer<{}>(Container);
