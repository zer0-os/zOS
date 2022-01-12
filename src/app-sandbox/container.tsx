import React from 'react';
import { RootState } from './store';
import { connectContainer } from '../store/redux-container';
import { AppSandbox, Apps } from '.';
import { ConnectionStatus } from '../lib/web3';

export interface Properties {
  route: string;
  connectionStatus: ConnectionStatus;
}

export interface State {
  hasConnected: boolean;
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

  state = { hasConnected: false };

  componentDidMount() {
    if (this.props.connectionStatus === ConnectionStatus.Connected) {
      this.setState({ hasConnected: true });
    }
  }

  componentDidUpdate(prevProps: Properties) {
    if (prevProps.connectionStatus !== ConnectionStatus.Connected && this.props.connectionStatus === ConnectionStatus.Connected) {
      this.setState({ hasConnected: true });
    }
  }

  get shouldRender() {
    return this.state.hasConnected;
  }

  render() {
    if (!this.shouldRender) return null;

    return (
      <AppSandbox selectedApp={Apps.Feed} znsRoute={this.props.route} />
    );
  }
}

export const AppSandboxContainer = connectContainer<{}>(Container);
