import React from 'react';

import { FeedContainer } from '../apps/feed/container';

import './styles.css';

export enum Apps {
  Feed = 'feed',
}

export interface Properties {
  znsRoute: string;
  selectedApp: Apps;
}

export class AppSandbox extends React.Component<Properties> {
  renderSelectedApp() {
    if (this.props.selectedApp === Apps.Feed) {
      return <FeedContainer />;
    }

    return null;
  }

  render() {
    return (
      <div className="app-sandbox">
        {this.renderSelectedApp()}
      </div>
    );
  }
}
