import React from 'react';
import classNames from 'classnames';

export interface Properties {
  className: string;
  isOpen: boolean;
  onClose: () => void;
}

interface State {
  isMenuOpen: boolean;
}

export default class PortalMenu extends React.Component<Properties, State> {
  state = { isMenuOpen: false };

  close = () => this.props.onClose();

  render() {
    return (
      <div
        className={classNames(this.props.className, { active: this.props.isOpen })}
        onClick={this.close}
      >
        <div className='portal-menu__content'>
          <ul>{this.props.children}</ul>
        </div>
        <div
          className='portal-menu__underlay'
          onClick={this.close}
        />
      </div>
    );
  }
}
