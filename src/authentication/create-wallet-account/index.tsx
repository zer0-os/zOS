import * as React from 'react';

import { WalletSelect } from '../../components/wallet-select';
import { Alert } from '@zero-tech/zui/components';

import { bemClassName } from '../../lib/bem';
import './styles.scss';

const cn = bemClassName('create-wallet-account');

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
      <div {...cn('')}>
        <div {...cn('main')}>
          <WalletSelect isConnecting={this.props.isConnecting} onSelect={this.props.onSelect} />
          {this.showError && (
            <Alert {...cn('error')} variant='error' isFilled>
              {this.props.error}
            </Alert>
          )}
        </div>
      </div>
    );
  }
}
