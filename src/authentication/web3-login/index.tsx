import * as React from 'react';

import { WalletSelect } from '../../components/wallet-select';

import { bem } from '../../lib/bem';
const c = bem('web3-login');
import './styles.scss';
import { Alert } from '@zero-tech/zui/components';

export interface Web3LoginProperties {
  error: string;
  isConnecting: boolean;
  onSelect: (connector: any) => void;
}

interface Web3LoginState {}

export class Web3Login extends React.Component<Web3LoginProperties, Web3LoginState> {
  render() {
    const { error, isConnecting, onSelect } = this.props;

    const shouldShowError = error && !isConnecting;

    return (
      <div>
        <WalletSelect isConnecting={isConnecting} onSelect={onSelect} />
        {shouldShowError && <Alert variant='error'>{error}</Alert>}
      </div>
    );
  }
}
