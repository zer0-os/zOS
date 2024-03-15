import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  successMessage: string;
}

export class Success extends React.Component<Properties> {
  render() {
    return <p {...cn('success-message')}>{this.props.successMessage}</p>;
  }
}
