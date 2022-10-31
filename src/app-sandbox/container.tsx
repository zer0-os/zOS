import React, { createRef } from 'react';
import { RootState } from '../store';
import { setWalletModalOpen } from '../store/web3';
import { connectContainer } from '../store/redux-container';
import { AppSandbox } from '.';
import { Apps } from '../lib/apps';
import { Chains, ConnectionStatus } from '../lib/web3';
import { ProviderService, inject as injectProviderService } from '../lib/web3/provider-service';
import { Store } from 'redux';
import { AppLayout, update as updateLayout } from '../store/layout';

export interface PlatformUser {
  account: string;
}

interface PublicProperties {
  store: Store<RootState>;
}

export interface Properties extends PublicProperties {
  route: string;
  address: string;
  chainId: Chains;
  connectionStatus: ConnectionStatus;
  user?: PlatformUser;

  providerService: ProviderService;

  selectedApp: Apps;
  setWalletModalOpen: (status: boolean) => void;

  layout: AppLayout;
  updateLayout: (layout: Partial<AppLayout>) => void;
}

interface State {
  hasConnected: boolean;
  web3Provider: any;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      layout,
      web3,
      apps: {
        selectedApp: { type },
      },
    } = state;
    const { chainId, address } = web3.value;

    return {
      route: state.zns.value.route,
      chainId,
      address,
      connectionStatus: web3.status,
      selectedApp: type,
      user: { account: address },
      layout: layout.value,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      setWalletModalOpen,
      updateLayout,
    };
  }

  /** Ref for tracking width of sandbox element */
  sandboxRef;
  /** Observer for responding to sandbox element size changes */
  observer;

  state = { hasConnected: false, web3Provider: null };

  componentDidMount() {
    if (this.props.connectionStatus === ConnectionStatus.Connected) {
      this.setState({
        hasConnected: true,
        web3Provider: this.props.providerService.get(),
      });
    }
    this.sandboxRef = createRef();
  }

  componentDidUpdate(prevProps: Properties) {
    if (
      prevProps.connectionStatus !== ConnectionStatus.Connected &&
      this.props.connectionStatus === ConnectionStatus.Connected
    ) {
      this.setState({
        hasConnected: true,
        web3Provider: this.props.providerService.get(),
      });
    }

    // Attach observer to container to track sandbox size changes
    if (this.sandboxRef?.current && !this.observer) {
      this.observer = new ResizeObserver(this.handleSandboxResize);
      this.observer.observe(this.sandboxRef.current);
    }
  }

  componentWillUnmount() {
    // Detach observer
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  get shouldRender() {
    return this.state.hasConnected;
  }

  get web3Provider() {
    return this.state.web3Provider;
  }

  openWallet = (): void => {
    this.props.setWalletModalOpen(true);
  };

  connectWallet = (): void => {
    this.openWallet();
  };

  /**
   * Handles sandbox element size changes.
   * Updates layout state with the current sandbox scrollbar width.
   */
  handleSandboxResize = (): void => {
    const { current: containerElement } = this.sandboxRef;
    const { offsetWidth, clientWidth } = containerElement;
    const scrollbarWidth = offsetWidth - clientWidth;

    if (this.props.layout.scrollbarWidth !== scrollbarWidth) {
      this.props.updateLayout({ scrollbarWidth });
    }
  };

  render() {
    if (!this.shouldRender) return null;

    return (
      <AppSandbox
        sandboxRef={this.sandboxRef}
        address={this.props.address}
        chainId={this.props.chainId}
        store={this.props.store}
        user={this.props.user}
        selectedApp={this.props.selectedApp}
        znsRoute={this.props.route}
        web3Provider={this.web3Provider}
        connectWallet={this.connectWallet}
        layout={this.props.layout}
        onUpdateLayout={this.props.updateLayout}
      />
    );
  }
}

export const AppSandboxContainer = injectProviderService<any>(connectContainer<{}>(Container));
