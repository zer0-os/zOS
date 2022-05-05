import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { History } from 'history';
import { useHistory } from 'react-router-dom';

import { AddressBar } from '.';
import { routeWithApp } from './util';
import { client } from '@zer0-os/zos-zns';
import { ProviderService, inject as injectProviderService } from '../../lib/web3/provider-service';
import { PlatformApp } from '../../lib/apps';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  history: History;
  route: string;
  deepestVisitedRoute: string;

  providerService: ProviderService;
  znsClient: any;

  app: PlatformApp;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { zns: { value: { route, deepestVisitedRoute } }, apps: { selectedApp: app } } = state;

    return { route, deepestVisitedRoute, app };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  znsClient() {
    return this.props.znsClient.get(this.props.providerService.get());
  }

  get isAtRootDomain() {
    return !this.props.route.includes('.');
  }

  get canNavigateDeeper() {
    return (
      ( this.props.route !== this.props.deepestVisitedRoute ) &&
      this.props.deepestVisitedRoute.includes(this.props.route)
    );
  }

  getNextRoute() {
    let [ nextRoute, ...segments ] = this.props.deepestVisitedRoute.split('.');

    for (const segment of segments) {
      const workingRoute = `${nextRoute}.${segment}`;

      if (nextRoute === this.props.route) {
        return workingRoute;
      }

      nextRoute = workingRoute;
    }
  }

  getPreviousRoute() {
    return this.props.route
      .split('.')
      .slice(0, -1)
      .join('.');
  }
  
  handleBack = () => {
    if (this.isAtRootDomain) return;

    this.goToRoute(this.getPreviousRoute());
  }

  handleForward = () => {
    if (!this.canNavigateDeeper) return;

    this.goToRoute(this.getNextRoute());
  }

  goToRoute = route => {
    this.props.history.push(routeWithApp(route, this.props.app.type));
  }

  render() {
    return (
      <AddressBar
        className={this.props.className}
        route={this.props.route}
        app={this.props.app}
        onBack={this.handleBack}
        onForward={this.handleForward}
        canGoBack={!this.isAtRootDomain}
        canGoForward={this.canNavigateDeeper}
        api={this.znsClient()}
        onSelect={this.goToRoute}
      />
    );
  }
}

const ConnectedContainer = injectProviderService<any>(connectContainer<{}>(Container));

export function AddressBarContainer(props: PublicProperties) {
  const history = useHistory();

  return <ConnectedContainer {...props} history={history} znsClient={client} />;
}
