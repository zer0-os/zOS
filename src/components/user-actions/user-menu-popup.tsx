import { Button } from '@zero-tech/zui/components';
import React from 'react';
import { createPortal } from 'react-dom';

import './styles.scss';

export interface Properties {
  address: string;
  onDisconnect: () => void;
}

export class UserMenuPopup extends React.Component<Properties> {
  render() {
    return <>{createPortal(<UserMenuPopupContent {...this.props} />, document.body)}</>;
  }
}

export class UserMenuPopupContent extends React.Component<Properties> {
  render() {
    const { address } = this.props;

    return (
      <div className='user-menu-popup'>
        <h3>
          <span
            title={address}
            className='user-menu-popup__address'
          >
            <span>{address.slice(0, 6)}</span>
            <span>...</span>
            <span className='eth-address__address-last-four'>{address.slice(-4)}</span>
          </span>
        </h3>
        <Button
          variant='primary'
          onPress={this.props.onDisconnect}
        >
          Disconnect
        </Button>
      </div>
    );
  }
}
