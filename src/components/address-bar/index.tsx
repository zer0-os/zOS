import React from 'react';

import './styles.scss';

export interface Properties {
  route: string;
}

export class AddressBar extends React.Component<Properties> {
  get routeSegments() {
    return this.props.route.split('.');
  }

  renderSegments() {
    return this.routeSegments.reduce((elements, segment, index) => {
      if (elements.length) {
        elements.push(<span key={index} className='address-bar__route-seperator'>.</span>);
      }

      return [
        ...elements,
        <span key={segment} className='address-bar__route-segment'>{segment}</span>
      ];
    }, []);
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
      <div className='address-bar'>
        <span className='address-bar__protocol'>0://</span>
        {this.renderRoute()}
      </div>
    );
  }
}
