import React, { JSXElementConstructor } from 'react';
import classNames from 'classnames';

import './styles.scss';
import { IconProps } from '@zero-tech/zui/components/Icons/Icons.types';

export interface Properties {
  className?: string;
  onClick: () => void;

  Icon: JSXElementConstructor<IconProps>;
  label?: string;
  size?: string | number;
  isFilled?: boolean;
}

export class IconButton extends React.Component<Properties> {
  handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    this.props.onClick();
  };

  render() {
    return (
      <button className={classNames('icon-button', this.props.className)} onClick={this.handleClick}>
        <this.props.Icon label={this.props.label} size={this.props.size} isFilled={this.props.isFilled} />
      </button>
    );
  }
}
