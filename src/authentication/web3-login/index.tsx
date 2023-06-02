import * as React from 'react';

import { Alert, Button } from '@zero-tech/zui/components';
import { WalletSelect } from '../../components/wallet-select';

import { bem } from '../../lib/bem';
const c = bem('web3-login');
import './styles.scss';

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
        {isConnecting ? (
          <Button isDisabled={true}>Waiting for wallet confirmation</Button>
        ) : (
          <WalletSelect isConnecting={true} onSelect={onSelect} />
        )}
        {shouldShowError && <Alert variant='error'>{error}</Alert>}
      </div>
    );
  }
}
