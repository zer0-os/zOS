import * as React from 'react';

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
        <div className={c('main')}>
          <div className={c('select-wallet')}>
            <WalletSelect isConnecting={this.props.isConnecting} onSelect={this.props.onSelect} />
          </div>
          {this.showError && <Alert variant='error'>{this.props.error}</Alert>}
        </div>
      </div>
    );
  }
}
