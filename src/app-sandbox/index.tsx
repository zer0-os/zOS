import React from 'react';

import { Apps } from '../lib/apps';
import { App as FeedApp } from '@zer0-os/zos-feed';

import './styles.scss';
import {ChannelsContainer} from '../platform-apps/channels/container';

export interface Properties {
  web3Provider: any;
  znsRoute: string;
  selectedApp: Apps;
}

export class AppSandbox extends React.Component<Properties> {
  renderSelectedApp() {
    const { znsRoute, selectedApp: app, web3Provider } = this.props;

    if (app === Apps.Feed) {
      return <FeedApp route={{znsRoute, app}} provider={web3Provider} />;
    }

    if (app === Apps.Channels) {
      return <ChannelsContainer route={{znsRoute, app}} provider={web3Provider} />;
    }

    return <div className='app-sandbox__error'>Error {app} application has not been implemented.</div>
  }

  render() {
    return (
      <div className="app-sandbox">
        {this.renderSelectedApp()}
      </div>
    );
  }
}
