import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { routeWithApp } from './util';
import { apps, PlatformApp } from '../../lib/apps';

import { Icons, IconButton } from '@zer0-os/zos-component-library';

import './styles.scss';

export interface Properties {
  className?: string;
  route: string;
  app: PlatformApp;

  canGoBack?: boolean;
  canGoForward?: boolean;

  onBack?: () => void;
  onForward?: () => void;
}

export class AddressBar extends React.Component<Properties> {
  get routeSegments() {
    return this.props.route.split('.');
  }

  get hasSelectedApp() {
    return !!this.props.app;
  }

  get app() {
    return this.props.app || {} as PlatformApp;
  }

  renderSegments() {
    const { elements } = this.routeSegments.reduce(({ elements, route }, segment, index) => {
      if (elements.length) {
        elements.push(<span key={index} className='address-bar__route-seperator'>.</span>);
      }

      route = route ? `${route}.${segment}` : segment;

      return {
        elements: [
          ...elements,
          <Link key={segment} className='address-bar__route-segment' to={routeWithApp(route, this.app.type)}>{segment}</Link>
        ],
        route,
      };
    }, { elements: [], route: '' });

    return elements;
  }

  renderRoute() {
    return (
      <span className='address-bar__route'>
        {this.renderSegments()}
        {this.hasSelectedApp && <span className='address-bar__route-app'>{this.app.name}</span>}
      </span>
    );
  }

  render() {
    const backButtonClass = classNames('address-bar__navigation-button', {
      'is-actionable': this.props.canGoBack,
    });

    const forwardButtonClass = classNames('address-bar__navigation-button', {
      'is-actionable': this.props.canGoForward,
    });

    return (
      <div className={classNames('address-bar', this.props.className)}>
        <div className='address-bar__navigation'>
          <IconButton icon={Icons.ChevronLeft} className={backButtonClass} onClick={this.props.onBack} />
          <IconButton icon={Icons.ChevronRight} className={forwardButtonClass} onClick={this.props.onForward} />
        </div>
        <div className='address-bar__inner'>
          <span className='address-bar__protocol'>0://</span>
          {this.renderRoute()}
        </div>
      </div>
    );
  }
}
