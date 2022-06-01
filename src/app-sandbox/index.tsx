import React from 'react';
import classNames from 'classnames';

import { Apps } from '../lib/apps';
import { App as FeedApp } from '@zer0-os/zos-feed';

import './styles.scss';

export interface Properties {
  web3Provider: any;
  znsRoute: string;
  selectedApp: Apps;
  isOverlayOpen: boolean;
}

export class AppSandbox extends React.Component<Properties> {
  renderSelectedApp() {
    const { znsRoute, selectedApp: app, web3Provider } = this.props;

    if (app === Apps.Feed) {
      return <FeedApp route={{ znsRoute, app }} provider={web3Provider} />;
    }

    return (
      <div className='error'>
        Error {app} application has not been implemented.
      </div>
    );
  }

  renderOverlay() {
    return (
      <div className='overlay__container'>
        <div
          className={classNames(
            'overlay',
            { overlay__open: this.props.isOverlayOpen },
            { overlay__closed: !this.props.isOverlayOpen }
          )}
        >
          <div className='overlay__content'>
            <div className='overlay__block'></div>
          </div>
        </div>
        )
      </div>
    );
  }

  render() {
    return (
      <div className='app-sandbox'>
        {this.renderSelectedApp()}
        {this.props.isOverlayOpen && 
          this.renderOverlay()
        }
      </div>
    );
  }
}
