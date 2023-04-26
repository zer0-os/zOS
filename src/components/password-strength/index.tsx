import * as React from 'react';

import { Strength } from '../../lib/password';

import './styles.scss';
import { bem } from '../../lib/bem';
const c = bem('password-strength');

export interface Properties {
  strength: Strength;
}

const statusNames = [
  'none',
  'weak',
  'acceptable',
  'good',
  'strong',
];

export class PasswordStrength extends React.Component<Properties> {
  barStatus(index) {
    return index > this.props.strength ? '' : 'filled';
  }

  get strengthText() {
    return this.props.strength === Strength.None ? '' : statusNames[this.props.strength];
  }

  render() {
    return (
      <div className={c('')} data-strength={statusNames[this.props.strength]}>
        <div className={c('status-bars')}>
          <div className={c('status-bar')} data-status={this.barStatus(1)} />
          <div className={c('status-bar')} data-status={this.barStatus(2)} />
          <div className={c('status-bar')} data-status={this.barStatus(3)} />
          <div className={c('status-bar')} data-status={this.barStatus(4)} />
        </div>
        <div>
          <span>Password Strength: </span>
          <span className={c('strength-text')}>{this.strengthText}</span>
        </div>
      </div>
    );
  }
}
