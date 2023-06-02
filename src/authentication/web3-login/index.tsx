import * as React from 'react';

import { bem } from '../../lib/bem';
const c = bem('web3-login');
import './styles.scss';
import { WalletSelect } from '../../components/wallet-select';

export interface Web3LoginProperties {
  error: string;
  isConnecting: boolean;
  onSelect: (connector: any) => void;
}

interface Web3LoginState {}

export class Web3Login extends React.Component<Web3LoginProperties, Web3LoginState> {
  render() {
    const { error, isConnecting, onSelect } = this.props;

    return (
      <div>
        <WalletSelect isConnecting={isConnecting} onSelect={onSelect} />
      </div>
    );
  }
}
