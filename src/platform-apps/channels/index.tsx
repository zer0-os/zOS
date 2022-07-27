import React from 'react';
import { withRouter } from 'react-router';
import { Route } from 'react-router-dom';

import { RootState } from '../../store';
import { Store } from 'redux';

import { ChannelsContainer } from './container';

interface Properties {
  store: Store<RootState>;
  provider: any;
  route: any;
  match: { url: string; path: string };
}

export class Component extends React.Component<Properties> {
  renderChild = ({ match }) => {
    return (
      <ChannelsContainer
        channelId={match.params.channelId || ''}
        {...this.props}
      />
    );
  };

  get rootUrl() {
    return this.props.match.path;
  }

  render() {
    return (
      <Route
        path={`${this.rootUrl}/:channelId?`}
        render={this.renderChild}
      />
    );
  }
}

export const Channels = withRouter<Properties>(Component);
