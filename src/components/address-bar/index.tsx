import React from 'react';
import classNames from 'classnames';

import { PlatformApp } from '../../lib/apps';

import { Icons, IconButton, ZnsLink } from '@zer0-os/zos-component-library';

import { ZNSDropdown } from '../zns-dropdown';

import './styles.scss';

export enum AddressBarMode {
  Display = 'display',
  Search = 'search',
}

export interface Properties {
  className?: string;
  route: string;
  app: PlatformApp;

  canGoBack?: boolean;
  canGoForward?: boolean;

  onBack?: () => void;
  onForward?: () => void;

  onSearch?: () => void;
  api?: any;
  onSelect?: (route: string) => void;
  addressBarMode?: AddressBarMode;
}

export interface State {
  mode: AddressBarMode;
}

export class AddressBar extends React.Component<Properties, State> {
  state = {
    mode: this.props.addressBarMode || AddressBarMode.Display,
  };

  get routeSegments() {
    return this.props.route.split('.');
  }

  get hasSelectedApp() {
    return !!this.props.app;
  }

  get app() {
    return this.props.app || ({} as PlatformApp);
  }

  renderSegments() {
    const { elements } = this.routeSegments.reduce(
      ({ elements, route }, segment, index) => {
        if (elements.length) {
          elements.push(
            <span
              key={index}
              className='address-bar__route-seperator'
            >
              .
            </span>
          );
        }

        route = route ? `${route}.${segment}` : segment;

        return {
          elements: [
            ...elements,
            <ZnsLink
              key={segment}
              className='address-bar__route-segment'
              route={route}
              app={this.app.type}
            >
              {segment}
            </ZnsLink>,
          ],
          route,
        };
      },
      { elements: [], route: '' }
    );

    return elements;
  }

  renderRoute() {
    return <span className='address-bar__route'>{this.renderSegments()}</span>;
  }

  showAddressBarMode = (value) => () => {
    this.setState({ mode: value });
  };

  closeAddressBarMode = () => {
    this.setState({ mode: AddressBarMode.Display });
  };

  onSelect = (route) => {
    this.setState({ mode: AddressBarMode.Display }, () => {
      this.props.onSelect(route);
    });
  };

  render() {
    const backButtonClass = classNames('address-bar__navigation-button', {
      'is-actionable': this.props.canGoBack,
    });

    const forwardButtonClass = classNames('address-bar__navigation-button', {
      'is-actionable': this.props.canGoForward,
    });

    const { mode } = this.state;

    return (
      <div className={classNames('address-bar', this.props.className)}>
        <div className='address-bar__navigation'>
          <IconButton
            icon={Icons.ChevronLeft}
            className={backButtonClass}
            onClick={this.props.onBack}
          />
          <IconButton
            icon={Icons.ChevronRight}
            className={forwardButtonClass}
            onClick={this.props.onForward}
          />
        </div>

        {AddressBarMode.Display === mode && (
          <div className='address-bar__inner'>
            <span className='address-bar__protocol'>0://</span>
            {this.renderRoute()}
            <span
              className='address-bar__search-trigger-region'
              onClick={this.showAddressBarMode(AddressBarMode.Search)}
            >
              {this.hasSelectedApp && <span className='address-bar__route-app'>{this.app.name}</span>}
            </span>
          </div>
        )}
        {AddressBarMode.Search === mode && (
          <>
            <div className='address-bar__underlay' />
            <div className='address-bar__inner-search-container'>
              <div className='address-bar__inner-search'>
                <ZNSDropdown
                  api={this.props.api}
                  onSelect={this.onSelect}
                  onCloseBar={this.closeAddressBarMode}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}
