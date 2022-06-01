import React from 'react';
import classNames from 'classnames';

import { Apps } from '../lib/apps';
import { App as FeedApp } from '@zer0-os/zos-feed';

import './styles.scss';

export interface Properties {
  web3Provider: any;
  znsRoute: string;
  selectedApp: Apps;
  hasOverlayDispaly: boolean;
  isOpen: boolean;
}

export class AppSandbox extends React.Component<Properties> {
  renderSelectedApp() {
    const { znsRoute, selectedApp: app, web3Provider } = this.props;

    if (app === Apps.Feed) {
      return <FeedApp route={{znsRoute, app}} provider={web3Provider} />;
    }

    return <div className='error'>Error {app} application has not been implemented.</div>
  }

  renderOverlay() {
    return (
      <div className='overlay__container'>
        {this.props.hasOverlayDispaly && (
          <div className={classNames('overlay', 'overlay_overlay', {overlay_open: this.props.isOpen}, {overlay_closed: !this.props.isOpen})}>
            <div className={classNames('overlay', 'overlay_container')}>
              <div className={classNames('overlay', 'overlay_content')}></div>
              <div className={classNames('overlay', 'overlay_block')}></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  render() {
    return (
      <div className="app-sandbox">
        {this.renderSelectedApp()}
        {this.renderOverlay()}
      </div>
    );
  }
}
