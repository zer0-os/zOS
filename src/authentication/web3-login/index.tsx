import * as React from 'react';

import { Alert } from '@zero-tech/zui/components';
import { WalletSelect } from '../../components/wallet-select';

import { bemClassName } from '../../lib/bem';
import './styles.scss';
import { Web3LoginErrors } from '../../store/login';

const cn = bemClassName('web3-login');

export interface Web3LoginProperties {
  error: string;
  isConnecting: boolean;
  onSelect: (connector: any) => void;
}

interface Web3LoginState {}

export class Web3Login extends React.Component<Web3LoginProperties, Web3LoginState> {
  render() {
    const { error, isConnecting, onSelect } = this.props;

    const errorText =
      error === Web3LoginErrors.PROFILE_NOT_FOUND
        ? 'The wallet you connected is not associated with a ZERO account'
        : error;

    return (
      <div {...cn('')}>
        <div {...cn('login')}>
          <div {...cn('select-wallet')}>
            <WalletSelect isConnecting={isConnecting} onSelect={onSelect} />
          </div>
          {error && (
            <div {...cn('error-container')}>
              <Alert {...cn('error')} variant='error' isFilled>
                {errorText}
              </Alert>
            </div>
          )}
        </div>
      </div>
    );
  }
}
