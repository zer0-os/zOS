import React from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

export interface Properties {
  className: string;
  isOpen: boolean;
  onClose: () => void;
}

export default class PortalMenu extends React.Component<Properties> {
  close = () => this.props.onClose();
  ref: HTMLDivElement = null;

  renderMenu() {
    if (!this.ref) {
      return null;
    }

    const { x, y } = this.ref.getBoundingClientRect();
    return (
      <div className={classNames(this.props.className)} onClick={this.close} style={{ top: y, left: x }}>
        <div className='portal-menu__content'>
          <ul>{this.props.children}</ul>
        </div>
        <div className='portal-menu__underlay' onClick={this.close} />
      </div>
    );
  }

  setPositionRef = (el) => {
    this.ref = el;
  };

  render() {
    return (
      <>
        <div ref={this.setPositionRef}></div>
        {this.props.isOpen && createPortal(this.renderMenu(), document.body)}
      </>
    );
  }
}
