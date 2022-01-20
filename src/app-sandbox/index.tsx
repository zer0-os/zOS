import React from 'react';

import { App as FeedApp } from '@zer0-os/zos-feed';

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
      return <FeedApp />;
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
