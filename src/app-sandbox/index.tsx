import React from 'react';

import { App as FeedApp } from '@zer0-os/zos-feed';

import './styles.scss';

export enum Apps {
  Feed = 'feed',
}

export interface Properties {
  web3Provider: any;
  znsRoute: string;
  selectedApp: Apps;
}

export class AppSandbox extends React.Component<Properties> {
  renderSelectedApp() {
    if (this.props.selectedApp === Apps.Feed) {
      return <FeedApp route={this.props.znsRoute} provider={this.props.web3Provider} />;
    }

    return null;
  }

  render() {
    return (
      <div className='application-content'>
        {this.renderSelectedApp()}
      </div>
    );
  }
}
