import React from 'react';
import { RootState } from './store';
import { connectContainer } from '../store/redux-container';
import { AppSandbox, Apps } from '.';

export interface Properties {
  route: string;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      route: state.zns.value.route,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { };
  }

  render() {
    return (
      <AppSandbox selectedApp={Apps.Feed} znsRoute={this.props.route} />
    );
  }
}

export const AppSandboxContainer = connectContainer<{}>(Container);
