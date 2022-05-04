import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { AppMenu } from '.';
import { Apps, apps as PlatformApps } from '../../lib/apps';

export interface Properties {
  selectedApp: Apps;

  route: string;
}

export class Container extends React.Component<Properties, {}> {
  static mapState(state: RootState): Partial<Properties> {
    const { zns: { value: { route } }, apps: { selectedApp: { type } } } = state;

    return { selectedApp: type, route };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  availableApps() {
    const availableApps = [Apps.Feed] as string[];

    return Object.keys(PlatformApps).filter(key => availableApps.includes(key)).map(key => PlatformApps[key]);
  }

  render() {
    const { selectedApp, route } = this.props;

    return (
      <AppMenu
        selectedApp={selectedApp}
        route={route}
        apps={this.availableApps()}
      />
    );
  }
}

export const AppMenuContainer = connectContainer<any>(Container);
