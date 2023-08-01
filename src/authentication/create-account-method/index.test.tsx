import React from 'react';
import { shallow } from 'enzyme';
import { RegistrationStage } from '../../store/registration';

import { CreateAccountMethod, CreateAccountMethodProps } from '.';
import { CreateEmailAccountContainer } from '../create-email-account/container';
import { CreateWalletAccountContainer } from '../create-wallet-account/container';

describe('CreateAccountMethod', () => {
  const defaultProps: CreateAccountMethodProps = {
    stage: RegistrationStage.EmailAccountCreation,
    isConnecting: false,
    onSelectionChange: jest.fn(),
  };

  const subject = (props: Partial<CreateAccountMethodProps> = {}) => {
    const allProps: CreateAccountMethodProps = {
      ...defaultProps,
      ...props,
    };

    return shallow(<CreateAccountMethod {...allProps} />);
  };

  it('calls onSelectionChange when ToggleGroup selection changes', () => {
    const onSelectionChange = jest.fn();
    const wrapper = subject({ onSelectionChange });

    wrapper.find('ToggleGroup').simulate('selectionChange', 'web3');
    expect(onSelectionChange).toHaveBeenCalledWith('web3');
  });

  it('renders CreateEmailAccountContainer when stage is EmailAccountCreation', () => {
    const wrapper = subject({ stage: RegistrationStage.EmailAccountCreation });
    expect(wrapper.find(CreateEmailAccountContainer)).toHaveLength(1);
    expect(wrapper.find(CreateWalletAccountContainer)).toHaveLength(0);
  });

  it('renders CreateWalletAccountContainer when stage is WalletAccountCreation', () => {
    const wrapper = subject({ stage: RegistrationStage.WalletAccountCreation });
    expect(wrapper.find(CreateEmailAccountContainer)).toHaveLength(0);
    expect(wrapper.find(CreateWalletAccountContainer)).toHaveLength(1);
  });
});
