import React from 'react';
import { Feed } from '../../apps/feed';

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
      return <Feed />;
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
