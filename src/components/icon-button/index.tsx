import React from 'react';
import classNames from 'classnames';

import { getIcon, Icons } from './icons';

import './styles.scss';

interface PublicProperties {
  icon: Icons;
  className?: string;

  onClick: () => void;
}

export interface Properties extends PublicProperties {
  getIcon: (icon: Icons) => any;
}

export class Component extends React.Component<Properties> {
  get iconClass() {
    return classNames('icon-button__icon', `zui-${this.props.icon}`);
  }

  get icon() {
    return this.props.getIcon(this.props.icon);
  }

  render() {
    return (
      <button className={classNames('icon-button', this.props.className)} onClick={this.props.onClick}>
        <svg className={this.iconClass} fill="none" xmlns="http://www.w3.org/2000/svg">
          {this.icon}
        </svg>
      </button>
    );
  }
}

export const IconButton: React.FC<PublicProperties> = (props) => <Component {...props} getIcon={getIcon} />;
