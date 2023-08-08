import * as React from 'react';
import { RegistrationStage } from '../../store/registration';
import { CreateEmailAccountContainer } from '../../authentication/create-email-account/container';
import { CreateWalletAccountContainer } from '../../authentication/create-wallet-account/container';

import { ToggleGroup } from '@zero-tech/zui/components';

import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('create-account-method');

export interface CreateAccountMethodProps {
  stage: RegistrationStage;
  isConnecting: boolean;
  onSelectionChange: (selectedOption: string) => void;
}

export const CreateAccountMethod: React.FC<CreateAccountMethodProps> = ({ stage, isConnecting, onSelectionChange }) => {
  const options = [
    { key: 'web3', label: 'Web3' },
    { key: 'email', label: 'Email' },
  ];

  const isWalletAccountCreationStage = stage === RegistrationStage.WalletAccountCreation;
  const selectedOption = isWalletAccountCreationStage ? 'web3' : 'email';
  const isConnectingWithWallet = isConnecting && isWalletAccountCreationStage;

  return (
    <div {...cn('', isConnecting && isWalletAccountCreationStage && 'is-connecting')}>
      <h3 {...cn('heading')}>Create Account</h3>

      {!isConnectingWithWallet && (
        <ToggleGroup
          {...cn('toggle-group')}
          options={options}
          variant='default'
          onSelectionChange={onSelectionChange}
          selection={selectedOption}
          selectionType='single'
          isRequired
          isDisabled={isConnecting}
        />
      )}
      {isWalletAccountCreationStage ? <CreateWalletAccountContainer /> : <CreateEmailAccountContainer />}
    </div>
  );
};
