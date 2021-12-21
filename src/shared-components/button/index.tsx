import React from 'react';
import classNames from 'classnames';

import './styles.css';

export interface Properties {
  className?: string;
}

export class Button extends React.Component<Properties> {
  render() {
    return (
      <div className={classNames('button', this.props.className)}>
        <span className='button__label'>{this.props.children}</span>
      </div>
    );
  }
}
