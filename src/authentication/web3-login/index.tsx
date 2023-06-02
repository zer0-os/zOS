import * as React from 'react';

import { Alert, Button } from '@zero-tech/zui/components';
import { WalletSelect } from '../../components/wallet-select';

import { bem } from '../../lib/bem';
const c = bem('web3-login');
import './styles.scss';
import { Link } from 'react-router-dom';

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
    const subheaderText = isConnecting ? 'Entering ZERO...' : 'Select your wallet';

    return (
      <div>
        <h3>Log in</h3>
        <span>{subheaderText}</span>
        {isConnecting ? (
          <Button isDisabled={true}>Waiting for wallet confirmation</Button>
        ) : (
          <WalletSelect isConnecting={false} onSelect={onSelect} />
        )}
        {shouldShowError && <Alert variant='error'>{error}</Alert>}
        <Link to='/login'>Back to log in</Link>
      </div>
    );
  }
}
