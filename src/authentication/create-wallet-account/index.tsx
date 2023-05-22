import * as React from 'react';
import { Link } from 'react-router-dom';

import { WalletSelect } from '../../components/wallet-select';

import './styles.scss';
import { bem } from '../../lib/bem';
const c = bem('create-wallet-account');

export interface Properties {}

export class CreateWalletAccount extends React.Component<Properties> {
  render() {
    return (
      <div className={c('')}>
        <h3 className={c('heading')}>CREATE YOUR ACCOUNT</h3>
        <div className={c('sub-heading')}>Step 1 of 2: Select your wallet</div>
        <div className={c('select-wallet')}>
          <WalletSelect isConnecting={false} />
        </div>
        <div className={c('other-options')}>
          <div>
            <span>Already on ZERO? </span>
            <Link to='/login'>Log in</Link>
          </div>
        </div>
      </div>
    );
  }
}
