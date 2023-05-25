import * as React from 'react';
import { Link } from 'react-router-dom';

import { WalletSelect } from '../../components/wallet-select';

import './styles.scss';
import { bem } from '../../lib/bem';
import { Alert } from '@zero-tech/zui/components';
const c = bem('create-wallet-account');

export interface Properties {
  error: string;
  isConnecting: boolean;
  onSelect: (connector: any) => void;
}

export class CreateWalletAccount extends React.Component<Properties> {
  get showError() {
    return this.props.error && !this.props.isConnecting;
  }

  render() {
    return (
      <div className={c('')}>
        <h3 className={c('heading')}>CREATE YOUR ACCOUNT</h3>
        <div className={c('sub-heading')}>Step 1 of 2: Select your wallet</div>
        <div className={c('main')}>
          <div className={c('select-wallet')}>
            <WalletSelect isConnecting={this.props.isConnecting} onSelect={this.props.onSelect} />
          </div>
          {this.showError && <Alert variant='error'>{this.props.error}</Alert>}
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
