import * as React from 'react';

import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('app-bar');

export interface Properties {}

export class AppBar extends React.Component<Properties> {
  render() {
    return <div {...cn('')} />;
  }
}
