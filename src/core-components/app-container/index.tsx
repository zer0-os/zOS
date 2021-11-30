import React from 'react';
import { FeedContainer } from '../../apps/feed/container';

import './styles.css';

export enum Apps {
  Feed = 'feed',
}

export interface Properties {
  selectedApp: Apps;
}

export class AppContainer extends React.Component<Properties> {
  renderSelectedApp() {
    if (this.props.selectedApp === Apps.Feed) {
      return <FeedContainer />;
    }

    return null;
  }

  render() {
    return (
      <div className="app-container">
        {this.renderSelectedApp()}
      </div>
    );
  }
}
