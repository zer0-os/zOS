import React from 'react';

import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('electron-titlebar');

export class ElectronTitlebar extends React.Component {
  render() {
    return <div {...cn('')}></div>;
  }
}
