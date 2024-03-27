import * as React from 'react';

import './styles.scss';
import { bemClassName } from '../../lib/bem';

const cn = bemClassName('admin-message');

export interface Properties {
  message: string;
}

export class AdminMessage extends React.PureComponent<Properties> {
  render() {
    return (
      <div {...cn('')}>
        <div {...cn('message')}>{this.props.message}</div>
      </div>
    );
  }
}
