import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import './styles.scss';

export interface Properties {
  className?: string;
  route: string;
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
          <Link key={segment} className='address-bar__route-segment' to={route}>{segment}</Link>
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
      </span>
    );
  }

  render() {
    return (
      <div className={classNames('address-bar', this.props.className)}>
        <div className='address-bar__inner'>
          <span className='address-bar__protocol'>0://</span>
          {this.renderRoute()}
        </div>
      </div>
    );
  }
}
