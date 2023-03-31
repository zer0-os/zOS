import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { AppMenu } from '.';
import { Apps, allApps } from '../../lib/apps';
import { inject as injectConfig } from '../config';

interface PublicProperties {
  config?: { defaultZnsRoute: string };
}

export interface Properties extends PublicProperties {
  selectedApp: Apps;
}

export class Container extends React.Component<Properties, {}> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      apps: {
        selectedApp: { type },
      },
    } = state;

    return { selectedApp: type };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  get allApps() {
    return allApps();
  }

  get defaultRoute(): string {
    return this.props.config.defaultZnsRoute;
  }

  render() {
    const { selectedApp } = this.props;

    return <AppMenu selectedApp={selectedApp} route={this.defaultRoute} apps={this.allApps} />;
  }
}

export const AppMenuContainer = injectConfig<PublicProperties>(connectContainer<any>(Container));
