import * as React from 'react';

import './styles.scss';
import { bem } from '../../lib/bem';
import moment from 'moment';
const c = bem('admin-message');

export interface Properties {
  message: string;
  createdAt: number;
}

export class AdminMessage extends React.PureComponent<Properties> {
  get formattedDate() {
    return moment(this.props.createdAt).format('DD/MM/YYYY');
  }

  render() {
    return (
      <div className={c('')}>
        <span className={c('date')}>{this.formattedDate} </span>
        {this.props.message}
      </div>
    );
  }
}
