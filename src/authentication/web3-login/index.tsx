import * as React from 'react';

import { Alert, Button } from '@zero-tech/zui/components';
import { IconLoading2 } from '@zero-tech/zui/icons';
import { WalletSelect } from '../../components/wallet-select';

import './styles.scss';
import { bem } from '../../lib/bem';

const c = bem('web3-login');

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
      <div className={c('')}>
        {isConnecting ? (
          <div className={c('connecting')}>
            <Button isDisabled={true} endEnhancer={<IconLoading2 isFilled={true} className={c('spinner')} size={20} />}>
              Waiting for wallet confirmation
            </Button>
          </div>
        ) : (
          <div className={c('login')}>
            <div className={c('select-wallet')}>
              <WalletSelect isConnecting={false} onSelect={onSelect} />
            </div>
            {error && <Alert variant='error'>{error}</Alert>}
          </div>
        )}
      </div>
    );
  }
}
