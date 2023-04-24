import { Button } from '@zero-tech/zui/components';
import React from 'react';
import { createPortal } from 'react-dom';

import './styles.scss';

export interface PopupProperties {
  address: string;
  isOpen: boolean;
  onAbort: () => void;
  onDisconnect: () => void;
}

export class UserMenuPopup extends React.Component<PopupProperties> {
  ref: HTMLDivElement = null;

  blockClick(e) {
    e.stopPropagation();
  }

  setPositionRef = (el) => {
    this.ref = el;
  };

  render() {
    return (
      <>
        <div ref={this.setPositionRef}></div>
        {createPortal(this.renderPortal(), document.body)}
      </>
    );
  }

  renderPortal() {
    if (!this.ref || !this.props.isOpen) {
      return null;
    }
    const { x, y } = this.ref.getBoundingClientRect();

    return (
      <>
        <div className='user-menu-popup__underlay' onClick={this.props.onAbort}>
          <div className='user-menu-popup__content' style={{ top: y, left: x }} onClick={this.blockClick}>
            <UserMenuPopupContent {...this.props} />
          </div>
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
        {address && (
          <h3>
            <span title={address} className='user-menu-popup__address'>
              <span>{address.slice(0, 6)}</span>
              <span>...</span>
              <span className='eth-address__address-last-four'>{address.slice(-4)}</span>
            </span>
          </h3>
        )}
        <Button variant='primary' onPress={this.props.onDisconnect}>
          {address ? 'Disconnect' : 'Logout'}
        </Button>
      </div>
    );
  }
}
