import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { AppMenu } from '.';
import { Apps, apps as PlatformApps } from '../../lib/apps';

export interface Properties {
  selectedApp: string;

  route: string;
}

export class Container extends React.Component<Properties, {}> {
  static mapState(state: RootState): Partial<Properties> {
    const { zns: { value: { route } }, apps: { selectedApp } } = state;

    return { selectedApp, route };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  availableApps() {
    const availableApps = [Apps.Feed];

    return Object.keys(PlatformApps).filter(app => availableApps.includes(Apps[app])).map(app => PlatformApps[app]);
  }

  render() {
    const { selectedApp, route } = this.props;

    return (
      <AppMenu
        selectedApp={Apps[selectedApp]}
        route={route}
        apps={this.availableApps()}
      />
    );
  }
}

export const AppMenuContainer = connectContainer<any>(Container);
