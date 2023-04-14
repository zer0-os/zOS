import React from 'react';

import { bem } from '../../lib/bem';
import './styles.scss';
const c = bem('stub-component');

export interface Properties {
  mode: string;
}

export class StubComponent extends React.Component<Properties> {
  render() {
    return <div className={c('')}>This is a test component [{this.props.mode}]</div>;
  }
}
