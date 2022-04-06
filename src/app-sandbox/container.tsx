import React from 'react';
import { RootState } from '../store';
import { connectContainer } from '../store/redux-container';
import { AppSandbox } from '.';
import { Apps } from '../lib/apps';
import { ConnectionStatus } from '../lib/web3';
import { ProviderService, inject as injectProviderService } from '../lib/web3/provider-service';

export interface Properties {
  route: string;
  connectionStatus: ConnectionStatus;

  providerService: ProviderService;

  selectedApp: Apps;
}

interface State {
  hasConnected: boolean;
  web3Provider: any;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      route: state.zns.value.route,
      connectionStatus: state.web3.status,
      selectedApp: state.apps.selectedApp as Apps,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { };
  }

  state = { hasConnected: false, web3Provider: null };

  componentDidMount() {
    if (this.props.connectionStatus === ConnectionStatus.Connected) {
      this.setState({
        hasConnected: true,
        web3Provider: this.props.providerService.get(),
      });
    }
  }

  componentDidUpdate(prevProps: Properties) {
    if (prevProps.connectionStatus !== ConnectionStatus.Connected && this.props.connectionStatus === ConnectionStatus.Connected) {
      this.setState({
        hasConnected: true,
        web3Provider: this.props.providerService.get(),
      });
    }
  }

  get shouldRender() {
    return this.state.hasConnected;
  }

  get web3Provider() {
    return this.state.web3Provider;
  }

  render() {
    if (!this.shouldRender) return null;

    return (
      <AppSandbox
        selectedApp={this.props.selectedApp}
        znsRoute={this.props.route}
        web3Provider={this.web3Provider}
      />
    );
  }
}

export const AppSandboxContainer = injectProviderService<any>(connectContainer<{}>(Container));
