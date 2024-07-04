import * as React from 'react';

import { Alert } from '@zero-tech/zui/components';
import { Button, Variant } from '@zero-tech/zui/components/Button/Button';

import { bemClassName } from '../../lib/bem';
import './styles.scss';
import { Web3LoginErrors } from '../../store/login';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { IconChevronRight } from '@zero-tech/zui/icons';

const cn = bemClassName('web3-login');

export interface Web3LoginProperties {
  error: string;
  isConnecting: boolean;
  isWalletConnected: boolean;
  onSelect: () => void;
}

interface Web3LoginState {}

export class Web3Login extends React.Component<Web3LoginProperties, Web3LoginState> {
  render() {
    const { error, isConnecting, isWalletConnected, onSelect } = this.props;

    const errorText =
      error === Web3LoginErrors.PROFILE_NOT_FOUND
        ? 'The wallet you connected is not associated with a ZERO account'
        : error;

    return (
      <div {...cn('')}>
        <div {...cn('login')}>
          <>
            <RainbowKitConnectButton isDisabled={isConnecting} />
            {isWalletConnected && (
              <Button isDisabled={isConnecting} onPress={onSelect}>
                Sign In
              </Button>
            )}
          </>
        </div>
        {error && (
          <Alert {...cn('error')} variant='error' isFilled>
            {errorText}
          </Alert>
        )}
      </div>
    );
  }
}

interface RainbowKitConnectButtonProperties {
  isDisabled?: boolean;
}

const RainbowKitConnectButton = ({ isDisabled }: RainbowKitConnectButtonProperties) => {
  return (
    <ConnectButton.Custom>
      {({ account, openAccountModal, openConnectModal }) => {
        if (account?.address) {
          return (
            <Button
              isDisabled={isDisabled}
              variant={Variant.Secondary}
              onPress={openAccountModal}
              endEnhancer={<IconChevronRight isFilled={true} />}
            >
              {account.displayName}
            </Button>
          );
        } else {
          return (
            <Button isDisabled={isDisabled} onPress={openConnectModal}>
              Connect Wallet
            </Button>
          );
        }
      }}
    </ConnectButton.Custom>
  );
};
