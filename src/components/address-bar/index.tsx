import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { routeWithApp } from './util';

import './styles.scss';

export interface Properties {
  className?: string;
  route: string;
  app: string;

  canGoBack?: boolean;
  canGoForward?: boolean;

  onBack?: () => void;
  onForward?: () => void;
}

export class AddressBar extends React.Component<Properties> {
  get routeSegments() {
    return this.props.route.split('.');
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
          <Link key={segment} className='address-bar__route-segment' to={routeWithApp(route, this.props.app)}>{segment}</Link>
        ],
        route,
      };
    }, { elements: [], route: '' });

    return elements;
  }

  renderRoute() {
    return (
      <span className='address-bar__route'>
        {this.renderSegments()}/{this.props.app}
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
          <button className={backButtonClass} onClick={this.props.onBack}>
            <svg className='address-bar__navigation-button-icon' fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.645583 5.70699L4.71399 9.77539C4.96195 10.0234 5.36398 10.0234 5.61195 9.77539C5.85991 9.52743 5.85991 9.12539 5.61195 8.87743L1.72856 4.99405L5.61194 1.11068C5.85943 0.863183 5.85812 0.461513 5.60901 0.215643C5.3622 -0.027966 4.96503 -0.0266684 4.71981 0.218548L0.645583 4.29277C0.255059 4.6833 0.255059 5.31646 0.645583 5.70699Z" />
            </svg>
          </button>
          <button className={forwardButtonClass} onClick={this.props.onForward}>
            <svg className='address-bar__navigation-button-icon' fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.35442 5.70699L1.28601 9.77539C1.03805 10.0234 0.636018 10.0234 0.388053 9.77539C0.140089 9.52743 0.14009 9.12539 0.388054 8.87743L4.27144 4.99405L0.388063 1.11068C0.14057 0.863183 0.141882 0.461513 0.390988 0.215643C0.637802 -0.027966 1.03497 -0.0266684 1.28019 0.218548L5.35442 4.29277C5.74494 4.6833 5.74494 5.31646 5.35442 5.70699Z" fill="#6A3991"/>
            </svg>
          </button>
        </div>
        <div className='address-bar__inner'>
          <span className='address-bar__protocol'>0://</span>
          {this.renderRoute()}
        </div>
      </div>
    );
  }
}
