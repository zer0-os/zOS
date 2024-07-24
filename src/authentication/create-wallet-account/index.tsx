import * as React from 'react';

import { Alert, Button } from '@zero-tech/zui/components';

import { bemClassName } from '../../lib/bem';
import './styles.scss';
import { RainbowKitConnectButton } from '../../lib/web3/rainbowkit/button';

const cn = bemClassName('create-wallet-account');

export interface Properties {
  error: string;
  isConnecting: boolean;
  isWalletConnected: boolean;
  onSelect: () => void;
}

export class CreateWalletAccount extends React.Component<Properties> {
  get showError() {
    return this.props.error && !this.props.isConnecting;
  }

  render() {
    return (
      <div {...cn('')}>
        <div {...cn('main')}>
          <RainbowKitConnectButton isDisabled={this.props.isConnecting} />
          {this.props.isWalletConnected && (
            <Button isDisabled={this.props.isConnecting} onPress={this.props.onSelect}>
              Register
            </Button>
          )}
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
