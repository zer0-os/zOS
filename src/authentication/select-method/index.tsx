import * as React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@zero-tech/zui/components';

import './styles.scss';
import { bem } from '../../lib/bem';
const c = bem('select-method');
const cn = (m?, s?) => ({ className: c(m, s) });

export interface Properties {
  onEmailSelected: () => void;
  onWalletSelected: () => void;
}

export class SelectMethod extends React.PureComponent<Properties> {
  render() {
    return (
      <div {...cn()}>
        <h3 {...cn('heading')}>How do you want to create an account?</h3>
        <form {...cn('form')}>
          <Button onPress={this.props.onEmailSelected}>Create account with email</Button>
          <Button onPress={this.props.onWalletSelected}>Create account with wallet</Button>
          <div {...cn('other-options')}>
            <span>Already on ZERO? </span>
            <Link to='/login'>Log in</Link>
          </div>
        </form>
      </div>
    );
  }
}
