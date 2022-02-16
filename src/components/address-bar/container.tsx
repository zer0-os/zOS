import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { AddressBar } from '.';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  route: string;
  deepestVisitedRoute: string;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { zns: { value: { route, deepestVisitedRoute } } } = state;

    return { route, deepestVisitedRoute };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
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

  render() {
    return (
      <AddressBar
        className={this.props.className}
        route={this.props.route}
        canGoBack={!this.isAtRootDomain}
        canGoForward={this.canNavigateDeeper}
      />
    );
  }
}

export const AddressBarContainer = connectContainer<PublicProperties>(Container);
