import React from 'react';
import { ToggleGroup } from '@zero-tech/zui/components';
import { CreateEmailAccountContainer } from '../../authentication/create-email-account/container';
import { CreateWalletAccountContainer } from '../../authentication/create-wallet-account/container';
import { RegistrationStage } from '../../store/registration';
import { bemClassName } from '../../lib/bem';

const cn = bemClassName('invite-main');

export interface CreateAccountMethodProps {
  stage: RegistrationStage;
  selectedOption: string;
  handleSelectionChange: (selectedOption: string) => void;
}

export class CreateAccountMethod extends React.Component<CreateAccountMethodProps> {
  render() {
    const options = [
      { key: 'web3', label: 'Web3' },
      { key: 'email', label: 'Email' },
    ];

    return (
      <>
        <h3 {...cn('heading')}>Create Account</h3>

        <ToggleGroup
          {...cn('toggle-group')}
          options={options}
          // variant deprecated but required
          variant='default'
          onSelectionChange={this.props.handleSelectionChange}
          selection={this.props.selectedOption}
          selectionType='single'
          isRequired
        />
        {this.props.stage === RegistrationStage.EmailAccountCreation && <CreateEmailAccountContainer />}
        {this.props.stage === RegistrationStage.WalletAccountCreation && <CreateWalletAccountContainer />}
      </>
    );
  }
}
