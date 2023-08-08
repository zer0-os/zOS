import * as React from 'react';

import './styles.scss';
import { bem } from '../../lib/bem';
const c = bem('admin-message');

export interface Properties {
  message: string;
}

export class AdminMessage extends React.PureComponent<Properties> {
  render() {
    return <div className={c('')}>{this.props.message}</div>;
  }
}
