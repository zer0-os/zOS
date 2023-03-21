import { Button } from '@zero-tech/zui/components';
import React from 'react';
import { createPortal } from 'react-dom';

import './styles.scss';

export interface PopupProperties {
  address: string;
  onAbort: () => void;
  onDisconnect: () => void;
}

export class UserMenuPopup extends React.Component<PopupProperties> {
  render() {
    return <>{createPortal(this.renderPortal(), document.body)}</>;
  }

  renderPortal() {
    return (
      <>
        <div
          className='user-menu-popup__underlay'
          onClick={this.props.onAbort}
        >
          <UserMenuPopupContent {...this.props} />
        </div>
      </>
    );
  }
}

export interface Properties {
  address: string;
  onDisconnect: () => void;
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
